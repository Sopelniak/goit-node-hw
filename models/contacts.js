const fs = require("fs/promises");
const path = require("path");
const { nanoid } = require("nanoid");

const constactsPath = path.join(__dirname, "contacts.json");

const readContacts = async (filePath) => await fs.readFile(filePath);

const updateContacts = async (data) =>
  await fs.writeFile(constactsPath, JSON.stringify(data, null, 2));

const listContacts = async () => {
  const data = await readContacts(constactsPath);
  return JSON.parse(data);
};

const getContactById = async (contactId) => {
  const bookId = String(contactId);
  const contacts = await listContacts();
  const contactById = contacts.find((item) => item.id === bookId);
  return contactById || null;
};

const removeContact = async (contactId) => {
  const contacts = await listContacts();
  const bookId = String(contactId);
  const index = contacts.findIndex((item) => item.id === bookId);
  if (index === -1) {
    return null;
  }
  const [result] = contacts.splice(index, 1);
  await updateContacts(contacts);
  return result;
};

const addContact = async (body) => {
  const contacts = await listContacts();
  const newContact = { id: nanoid(), ...body };
  contacts.push(newContact);
  await updateContacts(contacts);
  return newContact;
};

const updateContact = async (contactId, body) => {
  const contacts = await listContacts();
  const bookId = String(contactId);
  const index = contacts.findIndex((item) => item.id === bookId);
  if (index === -1) {
    return null;
  }
  contacts[index] = { contactId, ...body };
  await updateContacts(contacts);
  return contacts[index];
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
