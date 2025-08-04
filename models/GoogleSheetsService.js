const { google } = require('googleapis');

class GoogleSheetsService {
  constructor(credentials, spreadsheetId) {
    this.spreadsheetId = spreadsheetId;
    this.auth = this._getAuthClient(credentials);
    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }

  _getAuthClient(credentials) {
    const { client_email, private_key } = credentials;
    return new google.auth.JWT({
      email: client_email,
      key: private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
  }

  async initializeSheet() {
    try {
      // Verifica se il foglio "contatti" esiste
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId
      });
      
      const sheets = response.data.sheets;
      const contattiSheet = sheets.find(sheet => sheet.properties.title === 'contatti');
      
      if (!contattiSheet) {
        // Crea il foglio "contatti" se non esiste
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId: this.spreadsheetId,
          resource: {
            requests: [
              {
                addSheet: {
                  properties: {
                    title: 'contatti',
                    gridProperties: {
                      rowCount: 1000,
                      columnCount: 10
                    }
                  }
                }
              }
            ]
          }
        });
        
        // Aggiungi le intestazioni
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: 'contatti!A1:J1',
          valueInputOption: 'RAW',
          resource: {
            values: [[
              'ID', 'Nome', 'Cognome', 'Motivo Chiamata', 'Riferimento Immobile',
              'Numero Telefono', 'Email', 'Note', 'Data Chiamata', 'Tipo Ricerca'
            ]]
          }
        });
      }
      
      console.log('Foglio "contatti" inizializzato con successo');
      return true;
    } catch (error) {
      console.error('Errore durante l\'inizializzazione del foglio:', error);
      return false;
    }
  }

  async addContact(contact) {
    try {
      // Ottieni l'ultimo ID
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'contatti!A:A'
      });
      
      const values = response.data.values || [];
      const lastId = values.length > 1 ? parseInt(values[values.length - 1][0]) : 0;
      const newId = lastId + 1;
      
      // Aggiungi il nuovo contatto
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'contatti!A:J',
        valueInputOption: 'RAW',
        resource: {
          values: [[
            newId.toString(),
            contact.nome,
            contact.cognome,
            contact.motivo_chiamata,
            contact.riferimento_immobile || '',
            contact.numero_telefono,
            contact.email || '',
            contact.note || '',
            contact.data_chiamata,
            contact.tipo_ricerca
          ]]
        }
      });
      
      console.log(`Contatto aggiunto con ID: ${newId}`);
      return newId;
    } catch (error) {
      console.error('Errore durante l\'aggiunta del contatto:', error);
      throw error;
    }
  }

  async getContacts(filters = {}) {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'contatti!A:J'
      });
      
      const values = response.data.values || [];
      
      if (values.length <= 1) {
        return []; // Solo intestazioni o nessun dato
      }
      
      const headers = values[0];
      const contacts = values.slice(1).map(row => {
        const contact = {};
        headers.forEach((header, index) => {
          const key = this._headerToKey(header);
          contact[key] = row[index] || '';
        });
        return contact;
      });
      
      // Applica i filtri
      return this._filterContacts(contacts, filters);
    } catch (error) {
      console.error('Errore durante il recupero dei contatti:', error);
      throw error;
    }
  }

  async getContactById(id) {
    try {
      const contacts = await this.getContacts();
      return contacts.find(contact => contact.id === id.toString());
    } catch (error) {
      console.error(`Errore durante il recupero del contatto con ID ${id}:`, error);
      throw error;
    }
  }

  _headerToKey(header) {
    const mapping = {
      'ID': 'id',
      'Nome': 'nome',
      'Cognome': 'cognome',
      'Motivo Chiamata': 'motivo_chiamata',
      'Riferimento Immobile': 'riferimento_immobile',
      'Numero Telefono': 'numero_telefono',
      'Email': 'email',
      'Note': 'note',
      'Data Chiamata': 'data_chiamata',
      'Tipo Ricerca': 'tipo_ricerca'
    };
    
    return mapping[header] || header.toLowerCase().replace(/\s+/g, '_');
  }

  _filterContacts(contacts, filters) {
    let filtered = [...contacts];
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(contact => 
        contact.nome.toLowerCase().includes(searchTerm) ||
        contact.cognome.toLowerCase().includes(searchTerm) ||
        contact.numero_telefono.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filters.tipo) {
      filtered = filtered.filter(contact => 
        contact.tipo_ricerca === filters.tipo
      );
    }
    
    if (filters.date) {
      const filterDate = new Date(filters.date);
      filtered = filtered.filter(contact => {
        const contactDate = new Date(contact.data_chiamata.split('T')[0]);
        return contactDate >= filterDate;
      });
    }
    
    // Ordina per data (più recente prima)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.data_chiamata);
      const dateB = new Date(b.data_chiamata);
      return dateB - dateA;
    });
  }
}

module.exports = GoogleSheetsService; 