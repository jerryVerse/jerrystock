import fs from 'fs';

const html = fs.readFileSync('naver.html', 'utf8');

const parseSupplyDemand = (htmlBlock) => {
  const getVal = (name) => {
    const regex = new RegExp(`${name}<\/a><\/dt>\\s*<dd[^>]*><a[^>]*>([^<]+)<\\/a>`);
    const m = htmlBlock.match(regex);
    return m ? m[1].trim() + '억' : '-';
  };
  return {
    individual: getVal('개인'),
    foreign: getVal('외국인'),
    institutional: getVal('기관')
  };
};

const kospiMatch = html.match(/class="kospi_area[^>]*"([\s\S]*?)class="kosdaq_area"/);
if (kospiMatch) {
  console.log("KOSPI:", parseSupplyDemand(kospiMatch[1]));
}

const kosdaqHtml = html.split('class="kosdaq_area')[1];
if (kosdaqHtml) {
  console.log("KOSDAQ:", parseSupplyDemand(kosdaqHtml));
}
