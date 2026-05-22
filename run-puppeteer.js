const puppeteer = require('puppeteer');
const path = require('path');

async function run() {
    console.log('Starting puppeteer...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Log browser console messages
    page.on('console', msg => {
        console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
    });
    
    // Log page errors
    page.on('pageerror', err => {
        console.log(`[BROWSER ERROR] ${err.toString()}`);
    });

    try {
        console.log('Navigating to http://localhost:3000...');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
        
        console.log('Taking screenshot of login page...');
        await page.screenshot({ path: path.join(__dirname, 'login_page.png') });
        
        console.log('Logging in...');
        await page.type('#login-email', 'smartzonelk101@gmail.com');
        await page.type('#login-password', 'admin');
        await page.click('#login-form button[type="submit"]');
        
        console.log('Waiting for navigation/dashboard...');
        await new Promise(r => setTimeout(r, 2000));
        
        console.log('Taking screenshot of dashboard...');
        await page.screenshot({ path: path.join(__dirname, 'dashboard.png') });
        
        console.log('Clicking Inventory sidebar link...');
        await page.evaluate(() => {
            const link = document.querySelector('a[data-target="inventory-view"]');
            if (link) link.click();
            else console.log('Could not find inventory sidebar link!');
        });
        
        console.log('Waiting for inventory to load...');
        await new Promise(r => setTimeout(r, 2000));
        
        console.log('Taking screenshot of inventory page...');
        await page.screenshot({ path: path.join(__dirname, 'inventory.png') });
        
        console.log('Extracting inventory table HTML...');
        const tableHtml = await page.evaluate(() => {
            const tb = document.querySelector('#inv-table tbody');
            return tb ? tb.innerHTML : 'No #inv-table tbody found!';
        });
        console.log('Table HTML:', tableHtml);
        
        const productsCount = await page.evaluate(() => {
            return typeof products !== 'undefined' ? products.length : 'undefined';
        });
        console.log('Global products length in page:', productsCount);

    } catch (e) {
        console.error('Error during execution:', e);
    } finally {
        await browser.close();
        console.log('Browser closed.');
    }
}

run();
