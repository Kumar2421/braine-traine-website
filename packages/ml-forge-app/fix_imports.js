const fs = require('fs');
const path = require('path');

// Fix Auth Pages
const authPagesDir = 'src/pages/auth';
if (fs.existsSync(authPagesDir)) {
    const files = fs.readdirSync(authPagesDir).filter(f => f.endsWith('.tsx'));
    for (const file of files) {
        const p = path.join(authPagesDir, file);
        let code = fs.readFileSync(p, 'utf8');

        // Fix imports for forms
        code = code.replace(/from ["']\.\.\/components\/([a-zA-Z0-9_-]+)["']/g, (match, p1) => {
            // If it's one of the forms
            if (p1.includes('form')) {
                return `from "../../components/forms/${p1}"`;
            }
            return match;
        });

        if (!code.includes('import { SEO }')) {
            code = 'import { SEO } from "../../utils/SEO";\n' + code;
            const titleName = file.replace('Page.tsx', '');
            const match = code.match(/return\s*\(\s*(<div|<main|<section)/);
            if (match) {
                code = code.replace(match[0], `return (\n    <>\n      <SEO title="${titleName}" />\n      ${match[1]}`);
                const lastClose = code.lastIndexOf(')');
                if (lastClose > -1) {
                    code = code.substring(0, lastClose) + '    </>\n  )' + code.substring(lastClose + 1);
                }
            }
        }
        fs.writeFileSync(p, code);
    }

    // Also check AuthPages.css
    const cssPath = path.join(authPagesDir, 'AuthPages.css');
    if (fs.existsSync(cssPath)) {
        let cssCode = fs.readFileSync(cssPath, 'utf8');
        // nothing to fix for AuthPages.css usually, unless relative urls to images
    }
}

// Fix Home Page
const homePagesDir = 'src/pages/home';
if (fs.existsSync(homePagesDir)) {
    const files = fs.readdirSync(homePagesDir).filter(f => f.endsWith('.tsx'));
    for (const file of files) {
        const p = path.join(homePagesDir, file);
        let code = fs.readFileSync(p, 'utf8');

        code = code.replace(/import\s+'\.\.\/components\//g, "import '../../components/layout/");
        code = code.replace(/import\s+{([^}]+)}\s+from\s+["']\.\.\/components\/([a-zA-Z0-9_-]+)["']/g, (match, vars, p2) => {
            if (['Navbar', 'Footer', 'PricingSection'].includes(p2)) {
                return `import {${vars}} from "../../components/layout/${p2}"`;
            }
            return match; // Add more if needed
        });

        if (!code.includes('import { SEO }')) {
            code = 'import { SEO } from "../../utils/SEO";\n' + code;
            const titleName = file.replace('Page.tsx', '');
            const match = code.match(/return\s*\(\s*(<div|<main|<section|<>)/);
            if (match) {
                code = code.replace(match[0], `return (\n    <>\n      <SEO title="Home" />\n      ${match[1] === '<>' ? '' : match[1]}`);
                if (match[1] !== '<>') {
                    const lastClose = code.lastIndexOf(')');
                    if (lastClose > -1) {
                        code = code.substring(0, lastClose) + '    </>\n  )' + code.substring(lastClose + 1);
                    }
                }
            }
        }
        fs.writeFileSync(p, code);
    }
}

console.log('Fixed imports in pages.');
