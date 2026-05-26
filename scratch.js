const axios = require('axios');

async function getSupplyDemand() {
  try {
    const { data } = await axios.get('https://finance.naver.com/');
    // Very simple regex to find the supply demand table
    // It's in <div class="wht"> => <table> => KOSPI / KOSDAQ rows
    // Actually, Naver Finance main page has "외국인, 기관, 개인"
    const kospiMatch = data.match(/<dl class="b_ds_info">[\s\S]*?<dd>개인\s*<span[^>]*>(.*?)<\/span>[\s\S]*?<dd>외국인\s*<span[^>]*>(.*?)<\/span>[\s\S]*?<dd>기관\s*<span[^>]*>(.*?)<\/span>/);
    if (kospiMatch) {
      console.log('KOSPI Supply:', kospiMatch[1], kospiMatch[2], kospiMatch[3]);
    } else {
      console.log('Could not parse');
    }
  } catch (e) {
    console.error(e);
  }
}
getSupplyDemand();
