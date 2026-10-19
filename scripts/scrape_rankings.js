const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const TARGET_URL = 'https://tenup.fft.fr/classement-joueurs/padel?categorie=H';
const DATA_FILE_PATH = path.join(__dirname, '../data/ranking.json');

// "Mathéo  ALBERT" -> "matheo albert"
const normalizeName = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

async function scrapeRankings() {
    console.log('🎾 Starting Padel Ranking Scraper...');

    let dataContent = fs.readFileSync(DATA_FILE_PATH, 'utf8');
    let rankingData = [];
    try {
        rankingData = JSON.parse(dataContent);
    } catch (e) {
        console.error('❌ Could not parse ranking.json');
        return;
    }

    const playersToScrape = rankingData.filter(p => p.firstName && p.lastName);

    if (playersToScrape.length === 0) {
        console.log('⚠️ No players with firstName and lastName found to scrape.');
        return;
    }

    console.log(`🔍 Found ${playersToScrape.length} players to scrape.`);
    const notUpdated = [];

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
            const fullName = normalizeName(`${player.firstName} ${player.lastName}`);

            try {
                // Force Reload to clear state
                await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });

                // The search form lives in a dialog opened by "RECHERCHER UN JOUEUR"
                const dialogOpened = await page.evaluate(() => {
                    const btn = Array.from(document.querySelectorAll('button'))
                        .find(b => (b.innerText || '').trim().toUpperCase() === 'RECHERCHER UN JOUEUR');
                    if (btn) { btn.click(); return true; }
                    return false;
                });
                if (!dialogOpened) {
                    console.error("Button 'Rechercher un joueur' not found");
                    notUpdated.push(`${player.firstName} ${player.lastName}`);
                    continue;
                }

                await page.waitForSelector('input[name="prenom"]', { visible: true, timeout: 10000 });
                await page.type('input[name="prenom"]', player.firstName);
                await page.type('input[name="nom"]', player.lastName);

                // Submit button of the dialog (the page header has another "Rechercher")
                await page.evaluate(() => {
                    const searchBtns = Array.from(document.querySelectorAll('button'))
                        .filter(b => (b.innerText || '').trim().toUpperCase() === 'RECHERCHER' && b.offsetWidth);
                    searchBtns[searchBtns.length - 1].click();
                });

                // Ten'Up does not filter: it jumps to the page of the ranking that contains the player.
                // The default page already has rows, so wait for the player's own row (or "no result").
                try {
                    await page.waitForFunction((target) => {
                        const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
                        if (document.body.innerText.includes('Aucun joueur pour les filtres sélectionnés')) return true;
                        return Array.from(document.querySelectorAll('table tbody tr td:nth-child(3)'))
                            .some(td => norm(td.innerText) === target);
                    }, { timeout: 15000 }, fullName);
                } catch (e) {
                    console.log("Timed out waiting for results.");
                    notUpdated.push(`${player.firstName} ${player.lastName}`);
                    continue;
                }

                const result = await page.evaluate((target) => {
                    const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
                    // Columns: evolution | rank | name | points | actions
                    for (const row of document.querySelectorAll('table tbody tr')) {
                        const cells = row.querySelectorAll('td');
                        if (cells.length >= 4 && norm(cells[2].innerText) === target) {
                            return {
                                rank: parseInt(cells[1].innerText.replace(/\D/g, ''), 10),
                                points: parseFloat(cells[3].innerText.replace(/\s/g, '').replace(',', '.'))
                            };
                        }
                    }
                    return null;
                }, fullName);

                if (result) {
                    console.log(`✅ Found: Rank ${result.rank}, Points ${result.points}`);
                    
                    // Update current rank
                    player.nationalRank = result.rank;
                    player.points = result.points;

                    // History management
                    if (!player.history) player.history = [];
                    
                    const today = new Date().toISOString().split('T')[0];
                    const lastEntry = player.history.length > 0 ? player.history[player.history.length - 1] : null;

                    // Only add to history if it's a new day or stats changed
                    if (!lastEntry || lastEntry.date !== today || lastEntry.rank !== result.rank || lastEntry.points !== result.points) {
                        // Remove existing entry for today to overwrite with fresh scrape if needed
                        if (lastEntry && lastEntry.date === today) {
                            player.history.pop();
                        }
                        player.history.push({
                            date: today,
                            rank: result.rank,
                            points: result.points
                        });
                    }

                } else {
                    console.log(`❌ No results found for ${player.firstName} ${player.lastName} (not ranked, name mismatch, or profile hidden as "Joueur anonyme" on Ten'Up)`);
                    notUpdated.push(`${player.firstName} ${player.lastName}`);
                }

            } catch (err) {
                console.error(`❌ Error processing ${player.firstName}: ${err.message}`);
                notUpdated.push(`${player.firstName} ${player.lastName}`);
            }
        }

    } finally {
        await browser.close();
    }

    console.log(`\n📊 ${playersToScrape.length - notUpdated.length}/${playersToScrape.length} players updated.`);
    if (notUpdated.length) console.log(`⚠️ Not updated: ${notUpdated.join(', ')}`);

    console.log('\n💾 Saving updated ranking data...');

    // Format JSON carefully to maintain readability
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(rankingData, null, 4), 'utf8');
    console.log('✅ data/ranking.json saved.');
}

scrapeRankings();
