const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const TARGET_URL = 'https://tenup.fft.fr/classement-padel?categorie=H';
const DATA_FILE_PATH = path.join(__dirname, '../js/data.js');

async function scrapeRankings() {
    console.log('🎾 Starting Padel Ranking Scraper...');

    let dataContent = fs.readFileSync(DATA_FILE_PATH, 'utf8');

    const rankingDataMatch = dataContent.match(/const rankingData = (\[[\s\S]*?\]);/);
    if (!rankingDataMatch) {
        console.error('❌ Could not find rankingData in js/data.js');
        return;
    }

    let rankingData = eval(rankingDataMatch[1]);
    const playersToScrape = rankingData.filter(p => p.firstName && p.lastName);

    if (playersToScrape.length === 0) {
        console.log('⚠️ No players with firstName and lastName found to scrape.');
        return;
    }

    console.log(`🔍 Found ${playersToScrape.length} players to scrape.`);

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    try {
        // Initial load for cookies
        await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });

        // --- Cookie Banner Handling ---
        console.log("🍪 Checking for cookie banner...");
        try {
            await page.waitForSelector('body', { visible: true });
            await new Promise(r => setTimeout(r, 2000));

            const cookieDismissed = await page.evaluate(() => {
                const didomiBtn = document.getElementById('didomi-notice-agree-button');
                if (didomiBtn) { didomiBtn.click(); return "didomi-id"; }
                const buttons = Array.from(document.querySelectorAll('button, a, div[role="button"], span.button'));
                for (const b of buttons) {
                    const t = (b.innerText || b.textContent || "").toUpperCase().trim();
                    if (t === "TOUT ACCEPTER" || t === "ACCEPTER" || t === "ACCEPTER & FERMER") {
                        b.click();
                        return "text-match: " + t;
                    }
                }
                return false;
            });

            if (cookieDismissed) {
                console.log(`✅ Cookie banner dismissed.`);
                await new Promise(r => setTimeout(r, 2000));
            }
        } catch (e) { }

        for (const player of playersToScrape) {
            console.log(`\nProcessing ${player.firstName} ${player.lastName}...`);

            try {
                // Force Reload to clear state
                await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });
                await page.waitForSelector('input', { timeout: 10000 });

                const visibleInputs = await page.evaluateHandle(() => {
                    return Array.from(document.querySelectorAll('input'))
                        .filter(i => {
                            const style = window.getComputedStyle(i);
                            return style.display !== 'none' && style.visibility !== 'hidden' && i.type === 'text';
                        });
                });

                const inputHandles = [];
                const properties = await visibleInputs.getProperties();
                for (const prop of properties.values()) {
                    inputHandles.push(prop);
                }

                if (inputHandles.length < 2) {
                    console.log(`⚠️ Expected at least 2 text inputs, found ${inputHandles.length}.`);
                    continue;
                }

                // Correct Mapping: Input 0 = First Name, Input 1 = Last Name
                let firstNameInput = inputHandles[0];
                let lastNameInput = inputHandles[1];

                // Clear and type
                await firstNameInput.click({ clickCount: 3 });
                await firstNameInput.type(player.firstName);

                await lastNameInput.click({ clickCount: 3 });
                await lastNameInput.type(player.lastName);

                // Click Search button CORRECTLY (Last one)
                const searchBtnFound = await page.evaluate(() => {
                    const buttons = Array.from(document.querySelectorAll('button, input[type="submit"], div[role="button"], a.btn'));
                    const searchBtns = buttons.filter(b => {
                        const text = (b.innerText || b.textContent || "").toLowerCase();
                        return text.includes('rechercher');
                    });

                    if (searchBtns.length > 0) {
                        searchBtns[searchBtns.length - 1].click();
                        return true;
                    }
                    return false;
                });

                if (!searchBtnFound) {
                    console.error("Search button 'Rechercher' not found");
                    continue;
                }

                try {
                    await new Promise(r => setTimeout(r, 2000));
                    // Wait for table OR "No results"
                    await page.waitForFunction(() => {
                        return document.querySelector('table tbody tr') || document.body.innerText.includes('Aucun résultat');
                    }, { timeout: 8000 });
                } catch (e) {
                    console.log("Timed out waiting for results.");
                    continue;
                }

                // Check for "No results" explicitly
                const noResults = await page.evaluate(() => document.body.innerText.includes('Aucun résultat'));
                if (noResults) {
                    console.log(`❌ No results found for ${player.firstName} ${player.lastName}`);
                    continue;
                }

                const result = await page.evaluate((pLast, pFirst) => {
                    const rows = Array.from(document.querySelectorAll('table tbody tr'));
                    for (const row of rows) {
                        const cells = row.querySelectorAll('td');
                        if (cells.length >= 4) {
                            const nameText = cells[2].innerText.toLowerCase();
                            // Lax check
                            if (nameText.includes(pLast.toLowerCase())) {
                                const rankText = cells[1].innerText.trim().replace(/\D/g, '');
                                const pointsText = cells[3].innerText.trim().replace(',', '.');
                                return {
                                    rank: parseInt(rankText, 10),
                                    points: parseFloat(pointsText)
                                };
                            }
                        }
                    }
                    return null;
                }, player.lastName, player.firstName);

                if (result) {
                    console.log(`✅ Found: Rank ${result.rank}, Points ${result.points}`);
                    player.nationalRank = result.rank;
                    player.points = result.points;
                } else {
                    console.log(`❌ Player ${player.firstName} ${player.lastName} not found (Name mismatch).`);
                }

            } catch (err) {
                console.error(`❌ Error processing ${player.firstName}: ${err.message}`);
            }
        }

    } finally {
        await browser.close();
    }

    console.log('\n💾 Saving updated data...');

    let formattedData = "const rankingData = [\n";
    rankingData.forEach((p, idx) => {
        formattedData += "    { ";
        formattedData += `name: "${p.name}", `;
        formattedData += `firstName: "${p.firstName}", `;
        formattedData += `lastName: "${p.lastName}", `;
        formattedData += `nationalRank: ${p.nationalRank}, `;
        formattedData += `points: ${p.points}`;
        formattedData += " }";
        if (idx < rankingData.length - 1) formattedData += ",";
        formattedData += "\n";
    });
    formattedData += "];";

    const newDataContent = dataContent.replace(/const rankingData = \[[\s\S]*?\];/, formattedData);

    fs.writeFileSync(DATA_FILE_PATH, newDataContent, 'utf8');
    console.log('✅ js/data.js updated successfully!');
}

scrapeRankings();
