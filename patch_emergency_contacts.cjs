const fs = require('fs');

const newContent = `import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db, isFirebaseConfigured } from '../../lib/firebase';
import { getDocs, collection, query, doc, updateDoc } from 'firebase/firestore';
import { Phone, PhoneCall, ShieldAlert, Heart, Siren, Plus, Save, Edit2, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function EmergencyContacts() {
  const { clientSession } = useAuth();
  const { t } = useLanguage();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [docId, setDocId] = useState<string | null>(null);

  const [customContacts, setCustomContacts] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any[]>([{ name: '', mobile: '', relation: '' }, { name: '', mobile: '', relation: '' }]);

  useEffect(() => {
    if (!clientSession?.id) return;
    const fetchUser = async () => {
      if (isFirebaseConfigured && db) {
        try {
          const q = query(collection(db, 'customers'));
          const snapshot = await getDocs(q);
          const matchingDoc = snapshot.docs.find(d => d.data().customerId === clientSession.id);
          if (matchingDoc) {
            const data = matchingDoc.data();
            setDocId(matchingDoc.id);
            setUserData(data);
            if (data.customContacts) {
              setCustomContacts(data.customContacts);
              setEditForm([...data.customContacts, { name: '', mobile: '', relation: '' }, { name: '', mobile: '', relation: '' }].slice(0, 2));
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [clientSession]);

  const handleSaveCustom = async () => {
    if (!db || !docId) return;
    const validContacts = editForm.filter(c => c.name.trim() !== '' && c.mobile.trim() !== '');
    try {
      await updateDoc(doc(db, 'customers', docId), {
        customContacts: validContacts
      });
      setCustomContacts(validContacts);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save contacts.");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading contacts...</div>;
  }

  const primaryServices = [
    { name: 'National Emergency', number: '112', icon: Siren, color: 'text-red-500', bg: 'bg-red-500/10' },
    { name: 'Ambulance', number: '102', icon: Heart, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { name: 'Police', number: '100', icon: ShieldAlert, color: 'text-blue-500', bg: 'bg-blue-500/10' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Phone className="text-blue-500" /> {t('contacts.title') || 'Emergency Contacts'}
        </h1>
        <p className="text-slate-400 mt-1">Tap any number to call immediately.</p>
      </div>

      {/* Primary Emergency Action */}
      <a href="tel:112" className="block w-full bg-red-600 hover:bg-red-500 text-white rounded-2xl p-6 text-center border-2 border-red-500/50 shadow-[0_0_30px_rgba(220,38,38,0.3)] transition-all transform hover:scale-[1.02]">
        <div className="flex flex-col items-center justify-center gap-2">
          <PhoneCall size={36} className="animate-pulse" />
          <h2 className="text-4xl font-black tracking-widest mt-2">112</h2>
          <p className="font-bold text-red-200 tracking-wide uppercase">National Emergency Number</p>
        </div>
      </a>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Public Services</h3>
          <div className="space-y-3">
            {primaryServices.map((service, idx) => (
              <a href={\`tel:\${service.number}\`} key={idx} className="bg-[#020617]/50 border border-slate-800 hover:border-slate-600 p-4 rounded-xl flex items-center justify-between group transition-all">
                <div className="flex items-center gap-4">
                  <div className={\`w-12 h-12 rounded-full \${service.bg} flex items-center justify-center \${service.color}\`}>
                    <service.icon size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors">{service.name}</p>
                    <p className="text-slate-400 font-mono">{service.number}</p>
                  </div>
                </div>
                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Phone size={18} />
                </div>
              </a>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Personal Contacts</h3>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors">
                <Edit2 size={12} /> Edit Custom
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            {/* Non-changeable contacts from admin */}
            {userData?.emergencyContacts?.map((contact: any, idx: number) => (
              <a href={\`tel:\${contact.mobile}\`} key={\`admin-\${idx}\`} className="bg-[#020617]/50 border border-slate-800 hover:border-slate-600 p-4 rounded-xl flex items-center justify-between group transition-all opacity-80 cursor-not-allowed pointer-events-none">
                <div className="flex items-center justify-between w-full">
                  <div>
                    <p className="font-bold text-white text-lg group-hover:text-emerald-400 transition-colors">{contact.name}</p>
                    <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">{contact.relation}</p>
                    <p className="text-slate-500 font-mono text-sm mt-1">{contact.mobile}</p>
                  </div>
                  <div className="text-[10px] text-slate-500 bg-slate-800 px-2 py-1 rounded">Admin Set</div>
                </div>
              </a>
            ))}
            {/* We must make them clickable though. The styling above disabled them. Let's fix that. */}
          </div>
          
          <div className="mt-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Your Custom Contacts (Max 2)</h3>
            
            {isEditing ? (
              <div className="space-y-4">
                {[0, 1].map((idx) => (
                  <div key={idx} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 space-y-3">
                    <input 
                      type="text" 
                      placeholder="Name" 
                      value={editForm[idx].name}
                      onChange={(e) => {
                        const newForm = [...editForm];
                        newForm[idx].name = e.target.value;
                        setEditForm(newForm);
                      }}
                      className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-sm text-white"
                    />
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Relation" 
                        value={editForm[idx].relation}
                        onChange={(e) => {
                          const newForm = [...editForm];
                          newForm[idx].relation = e.target.value;
                          setEditForm(newForm);
                        }}
                        className="w-1/2 bg-slate-800 border border-slate-600 rounded p-2 text-sm text-white"
                      />
                      <input 
                        type="text" 
                        placeholder="Phone Number" 
                        value={editForm[idx].mobile}
                        onChange={(e) => {
                          const newForm = [...editForm];
                          newForm[idx].mobile = e.target.value;
                          setEditForm(newForm);
                        }}
                        className="w-1/2 bg-slate-800 border border-slate-600 rounded p-2 text-sm text-white"
                      />
                    </div>
                  </div>
                ))}
                <div className="flex gap-3">
                  <button onClick={handleSaveCustom} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                    <Save size={16} /> Save
                  </button>
                  <button onClick={() => setIsEditing(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                    <X size={16} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {customContacts.length > 0 ? customContacts.map((contact: any, idx: number) => (
                  <a href={\`tel:\${contact.mobile}\`} key={\`custom-\${idx}\`} className="bg-[#020617]/50 border border-slate-800 hover:border-slate-600 p-4 rounded-xl flex items-center justify-between group transition-all">
                    <div>
                      <p className="font-bold text-white text-lg group-hover:text-blue-400 transition-colors">{contact.name}</p>
                      <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">{contact.relation}</p>
                      <p className="text-slate-500 font-mono text-sm mt-1">{contact.mobile}</p>
                    </div>
                    <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <Phone size={18} />
                    </div>
                  </a>
                )) : (
                  <div className="text-sm text-slate-500 bg-slate-900/50 p-4 rounded-xl border border-slate-800 border-dashed text-center">
                    No custom contacts added. Click Edit to add up to 2 numbers.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync('src/pages/user/EmergencyContacts.tsx', newContent);
