const fs = require('fs');

const filePath = 'src/components/landing/HeroSection.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const target = `            await signInWithEmailAndPassword(auth, email, password);
            navigate('/admin/dashboard');
          } catch (err: any) {
            setError(err.message || 'Invalid admin credentials');
          }`;

const replacement = `            await signInWithEmailAndPassword(auth, email, password);
            navigate('/admin/dashboard');
          } catch (err: any) {
            console.error("Auth Error:", err);
            // Check if it's the mock credentials trying to go through Firebase
            if (email === 'admin@rakshak.in' && password === 'admin123') {
               if (typeof window !== 'undefined') (window as any).enableMockAdmin?.();
               navigate('/admin/dashboard');
               return;
            }
            // Friendly error message instead of raw Firebase string
            if (err.code === 'auth/invalid-credential' || err.message?.includes('invalid-credential')) {
              setError('Invalid email or password. For demo, use: admin@rakshak.in / admin123');
            } else {
              setError('Login failed. Please check your credentials.');
            }
          }`;

content = content.replace(target, replacement);

fs.writeFileSync(filePath, content);
