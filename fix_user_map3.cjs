const fs = require('fs');
let content = fs.readFileSync('src/pages/user/UserDashboard.tsx', 'utf8');

// I need to add </div></div> after the MapContainer logic.
const fixMarker = `                   </MapContainer>
                )}
             </div>
          </div>
          {/* Action Strip */}`;

content = content.replace("                   </MapContainer>\n                )}\n          </div>\n          {/* Action Strip */}", fixMarker);

// Let's just be careful. I will find `</MapContainer>\n                )}` and insert `</div></div>` before `\n          {/* Action Strip */}`
content = content.replace(`                   </MapContainer>\n                )}\n          {/* Action Strip */}`, fixMarker);
content = content.replace(`                   </MapContainer>\n                )}\n                </div>\n             </div>\n          </div>\n          {/* Action Strip */}`, fixMarker);

// Wait, let's just see where MapContainer ends.
