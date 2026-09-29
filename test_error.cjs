const fs = require('fs');
const filePath = 'src/components/landing/HeroSection.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {`;

const replacementStr = `      }
    } catch (err: any) {
      console.error("Login Error:", err);
      setError('An unexpected error occurred: ' + (err.message || 'Unknown error'));
    } finally {`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync(filePath, content);
console.log("Patched catch block to surface error details");
