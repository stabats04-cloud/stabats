const fs = require('fs');
const path = require('path');

const pages = [
  { file: 'crm.html', title: 'CRM Architecture & Engineering | Stabats', desc: 'Bespoke CRM platforms and deep enterprise automations that synchronize leads, automate communications, and give executives live forecast transparency.' },
  { file: 'erp.html', title: 'Enterprise ERP Engineering | Stabats', desc: 'Modular, event-driven enterprise platforms with real-time inventory synchronization, immutable ledger accuracy, and automated multi-entity compliance.' },
  { file: 'custom-software.html', title: 'Bespoke Custom Software Engineering | Stabats', desc: 'Custom digital infrastructure and software systems engineered to replace legacy bottlenecks and accelerate business velocity.' },
  { file: 'web-apps.html', title: 'High-Performance Web Applications | Stabats', desc: 'State-of-the-art web applications designed with Apple-grade fluid interactions and extreme performance.' },
  { file: 'ai-automation.html', title: 'Enterprise AI Automations & Workflows | Stabats', desc: 'Autonomous AI workflows and intelligent agentic pipelines designed to scale operations.' },
  { file: 'ai-voice-calling.html', title: 'AI Voice Agents & Telephony | Stabats', desc: 'Ultra-low latency conversational AI voice agents capable of conducting human-grade phone interactions.' },
  { file: 'about.html', title: 'About Stabats | Engineering Scalable Intelligence', desc: 'Learn about Stabats, our mission, leadership, and digital architecture philosophy.' },
  { file: 'get-in-touch.html', title: 'Get in Touch | Stabats Architecture Consultation', desc: 'Schedule an architecture blueprint session with Stabats principal software architects.' }
];

const headMeta = (p) => `  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${p.title}</title>
  <meta name="description" content="${p.desc}">
  <link rel="icon" type="image/png" href="assets/stabats-3d-emblem.png">

  <!-- Google Web Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="stylesheet" href="css/styles.css?v=11.0">`;

pages.forEach(p => {
  const filePath = path.join(__dirname, '..', p.file);
  if (!fs.existsSync(filePath)) {
    console.log('File does not exist:', filePath);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');

  if (!content.includes('name="viewport"')) {
    // Replace <head> with <head>\n + headMeta
    // If the file already has font-awesome and styles.css directly below <head>, strip them so they aren't duplicated
    content = content.replace(
      /<head>[\r\n\s]*(<link rel="stylesheet" href="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome\/6\.5\.1\/css\/all\.min\.css">[\r\n\s]*)?(<link rel="stylesheet" href="css\/styles\.css[^"]*">[\r\n\s]*)?/,
      `<head>\n${headMeta(p)}\n`
    );
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully injected viewport meta into:', p.file);
  } else {
    // Just ensure the styles.css version is updated
    content = content.replace(/css\/styles\.css\?v=[0-9.]+/g, 'css/styles.css?v=11.0');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Already had viewport, bumped version in:', p.file);
  }
});
