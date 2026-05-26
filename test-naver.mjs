import { ofetch } from 'ofetch';

async function test() {
  const buf = await ofetch('https://finance.naver.com/', { responseType: 'arrayBuffer' });
  const html = new TextDecoder('euc-kr').decode(buf);
  
  console.log("HTML length:", html.length);
  
  const kospiMatch = html.match(/class="kospi_area"([\s\S]*?)class="kosdaq_area"/);
  if (kospiMatch) {
    const kospiHtml = kospiMatch[1];
    // Find <dl class="b_ds_info">
    const dlMatch = kospiHtml.match(/<dl class="b_ds_info">([\s\S]*?)<\/dl>/);
    if (dlMatch) {
      const dlHtml = dlMatch[1];
      const individual = dlHtml.match(/<dd>개인\s*<span[^>]*>(.*?)<\/span>/);
      const foreign = dlHtml.match(/<dd>외국인\s*<span[^>]*>(.*?)<\/span>/);
      const institutional = dlHtml.match(/<dd>기관\s*<span[^>]*>(.*?)<\/span>/);
      console.log('KOSPI:', individual?.[1], foreign?.[1], institutional?.[1]);
    } else {
      console.log('No b_ds_info in KOSPI');
    }
  }
  
  const kosdaqMatch = html.match(/class="kosdaq_area"([\s\S]*?)class="kpi_b"/);
  if (kosdaqMatch) {
    const kosdaqHtml = kosdaqMatch[1];
    const dlMatch = kosdaqHtml.match(/<dl class="b_ds_info">([\s\S]*?)<\/dl>/);
    if (dlMatch) {
      const dlHtml = dlMatch[1];
      const individual = dlHtml.match(/<dd>개인\s*<span[^>]*>(.*?)<\/span>/);
      const foreign = dlHtml.match(/<dd>외국인\s*<span[^>]*>(.*?)<\/span>/);
      const institutional = dlHtml.match(/<dd>기관\s*<span[^>]*>(.*?)<\/span>/);
      console.log('KOSDAQ:', individual?.[1], foreign?.[1], institutional?.[1]);
    } else {
      console.log('No b_ds_info in KOSDAQ');
    }
  }
}

test();
