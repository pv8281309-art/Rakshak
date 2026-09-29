const fs = require('fs');

const filePath = 'src/pages/admin/AccessProvisioning.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const hookTarget = `  const availableDistricts = useMemo(() => {
    return formData.state ? (indianStates[formData.state] || []) : [];
  }, [formData.state]);`;

const hookReplacement = `  const availableDistricts = useMemo(() => {
    return formData.state ? (indianStates[formData.state] || []) : [];
  }, [formData.state]);

  const [isFetchingPin, setIsFetchingPin] = useState(false);

  useEffect(() => {
    if (formData.pinCode && formData.pinCode.length === 6) {
      const fetchLocation = async () => {
        setIsFetchingPin(true);
        try {
          const res = await fetch(\`https://api.postalpincode.in/pincode/\${formData.pinCode}\`);
          const data = await res.json();
          if (data && data[0] && data[0].Status === 'Success') {
            const postOffice = data[0].PostOffice[0];
            setFormData(prev => ({
              ...prev,
              state: postOffice.State,
              district: postOffice.District,
              city: postOffice.Block !== 'NA' ? postOffice.Block : postOffice.Name,
            }));
            setValidationError('');
          } else {
            setValidationError('Invalid PIN Code or not found.');
          }
        } catch (err) {
          console.error("Error fetching PIN details:", err);
        } finally {
          setIsFetchingPin(false);
        }
      };
      fetchLocation();
    }
  }, [formData.pinCode]);`;

content = content.replace(hookTarget, hookReplacement);

const pinInputTarget = `                        <input type="text" name="pinCode" value={formData.pinCode} onChange={handleInputChange} maxLength={6} className="w-full bg-[#060D1A] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-rakshak-cyan outline-none font-mono" placeholder="6-digit PIN" />`;

const pinInputReplacement = `                        <div className="relative">
                          <input type="text" name="pinCode" value={formData.pinCode} onChange={handleInputChange} maxLength={6} className="w-full bg-[#060D1A] border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-rakshak-cyan outline-none font-mono pr-10" placeholder="6-digit PIN" />
                          {isFetchingPin && <RefreshCw size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-rakshak-cyan" />}
                        </div>`;

content = content.replace(pinInputTarget, pinInputReplacement);

fs.writeFileSync(filePath, content);
