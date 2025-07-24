import { chromium } from 'playwright';

async function debugEditorLayout() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4321/editor?edit=01-astro-sphere-file-structure');
  await page.waitForLoadState('networkidle');
  
  // Get main element details
  const mainInfo = await page.evaluate(() => {
    const main = document.querySelector('main');
    const body = document.querySelector('body');
    const footer = document.querySelector('footer');
    
    return {
      mainExists: !!main,
      mainHeight: main ? main.offsetHeight : 0,
      mainChildren: main ? main.children.length : 0,
      mainInnerHTML: main ? main.innerHTML.slice(0, 200) : 'N/A',
      bodyHeight: body ? body.offsetHeight : 0,
      footerTop: footer ? footer.getBoundingClientRect().top : 0,
      footerOffsetTop: footer ? footer.offsetTop : 0,
      bodyClasses: body ? body.className : '',
      mainClasses: main ? main.className : ''
    };
  });
  
  console.log('Main element info:', mainInfo);
  
  // Get the structure
  const structure = await page.evaluate(() => {
    const getStructure = (element, depth = 0) => {
      if (!element || depth > 5) return '';
      const indent = '  '.repeat(depth);
      const tag = element.tagName.toLowerCase();
      const classes = element.className ? `.${element.className.split(' ').join('.')}` : '';
      const id = element.id ? `#${element.id}` : '';
      let result = `${indent}<${tag}${id}${classes}>`;
      
      if (element.children.length > 0 && depth < 5) {
        result += '\n';
        for (let child of element.children) {
          result += getStructure(child, depth + 1);
        }
        result += `${indent}</${tag}>\n`;
      } else {
        result += `</${tag}>\n`;
      }
      
      return result;
    };
    
    return getStructure(document.body);
  });
  
  console.log('\nPage structure:\n', structure);
  
  await page.screenshot({ path: 'editor-layout-debug.png', fullPage: true });
  
  console.log('\nScreenshot saved as editor-layout-debug.png');
  
  await browser.close();
}

debugEditorLayout().catch(console.error);