const fs = require('fs');
const filePath = 'src/components/landing/HeroSection.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const fullTarget = `        if (validLogin) {
          const session = { 
            role: activeTab, 
            id: userId, 
            ...(activeTab === 'family' && { car: carNumber }) 
          };
          localStorage.setItem('rakshak_user_session', JSON.stringify(session));
          setSession(session);
          navigate(\`/\${activeTab}/dashboard\`);
        } else {
          setError(\`Invalid \${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} ID or Password\`);
        }
      }
    } catch (err: any) {`;

const fixedStr = `        if (validLogin) {
          const session = { 
            role: activeTab, 
            id: userId, 
            ...(activeTab === 'family' && { car: carNumber }) 
          };
          localStorage.setItem('rakshak_user_session', JSON.stringify(session));
          setSession(session);
          navigate(\`/\${activeTab}/dashboard\`);
        } else {
          setError(\`Invalid \${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} ID or Password\`);
        }
      }
    } catch (err: any) {`;

// Just replacing the catch block again to make sure it's catching correctly
const targetStr = `    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {`;

const fixedCatch = `    } catch (err: any) {
      console.error("Login Error caught:", err);
      setError('An unexpected error occurred: ' + (err.message || 'Unknown error'));
    } finally {`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, fixedCatch);
  fs.writeFileSync(filePath, content);
  console.log("Patched catch block");
} else {
  console.log("Catch block already patched or not found.");
}

