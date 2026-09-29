const firebaseMock = {
  serverTimestamp: () => ({ _timestamp: true })
};
const formData = { customerId: 'CUST123' };
const customers = [{ id: 'CUST000' }];
const customerData = {
    name: 'Test',
    createdAt: firebaseMock.serverTimestamp()
};

const localData = { ...customerData, id: formData.customerId, createdAt: new Date().toISOString() };
const updated = [localData, ...customers];
console.log(JSON.stringify(updated, null, 2));
