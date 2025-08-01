document.addEventListener('DOMContentLoaded', function() {
    // Riferimenti agli elementi del DOM
    const searchForm = document.getElementById('search-form');
    const resetFiltersBtn = document.getElementById('reset-filters');
    const contactModal = new bootstrap.Modal(document.getElementById('contactModal'));
    const contactDetails = document.getElementById('contact-details');
    
    // Aggiungi event listener per i pulsanti di visualizzazione contatto
    document.querySelectorAll('.view-contact').forEach(button => {
        button.addEventListener('click', function() {
            const contactId = this.getAttribute('data-id');
            viewContactDetails(contactId);
        });
    });
    
    // Funzione per visualizzare i dettagli del contatto
    function viewContactDetails(contactId) {
        // Effettua una richiesta AJAX per ottenere i dettagli del contatto
        fetch(`/api/contatti/${contactId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Errore nel recupero dei dettagli del contatto');
                }
                return response.json();
            })
            .then(contatto => {
                // Formatta la data
                const dataChiamata = new Date(contatto.data_chiamata).toLocaleString('it-IT');
                
                // Crea l'HTML per i dettagli del contatto
                const detailsHtml = `
                    <div class="row">
                        <div class="col-md-6">
                            <div class="contact-detail-row">
                                <div class="contact-detail-label">Nome</div>
                                <div>${contatto.nome}</div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="contact-detail-row">
                                <div class="contact-detail-label">Cognome</div>
                                <div>${contatto.cognome}</div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="contact-detail-row">
                                <div class="contact-detail-label">Telefono</div>
                                <div>${contatto.numero_telefono}</div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="contact-detail-row">
                                <div class="contact-detail-label">Email</div>
                                <div>${contatto.email || 'Non specificata'}</div>
                            </div>
                        </div>
                    </div>
                    <div class="contact-detail-row">
                        <div class="contact-detail-label">Motivo della Chiamata</div>
                        <div>${contatto.motivo_chiamata}</div>
                    </div>
                    <div class="contact-detail-row">
                        <div class="contact-detail-label">Riferimento Immobile</div>
                        <div>${contatto.riferimento_immobile || 'Non specificato'}</div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="contact-detail-row">
                                <div class="contact-detail-label">Tipo di Ricerca</div>
                                <div>
                                    <span class="badge ${getBadgeClass(contatto.tipo_ricerca)}">
                                        ${contatto.tipo_ricerca}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="contact-detail-row">
                                <div class="contact-detail-label">Data e Ora della Chiamata</div>
                                <div>${dataChiamata}</div>
                            </div>
                        </div>
                    </div>
                    <div class="contact-detail-row">
                        <div class="contact-detail-label">Note</div>
                        <div>${contatto.note || 'Nessuna nota'}</div>
                    </div>
                `;
                
                // Inserisci l'HTML nel modal
                contactDetails.innerHTML = detailsHtml;
                
                // Mostra il modal
                contactModal.show();
            })
            .catch(error => {
                console.error('Errore:', error);
                alert('Si è verificato un errore nel recupero dei dettagli del contatto');
            });
    }
    
    // Funzione per ottenere la classe del badge in base al tipo di ricerca
    function getBadgeClass(tipoRicerca) {
        switch(tipoRicerca) {
            case 'Vendita':
                return 'bg-success';
            case 'Affitto':
                return 'bg-primary';
            case 'Entrambi':
                return 'bg-info';
            default:
                return 'bg-secondary';
        }
    }
    
    // Gestione del reset dei filtri
    resetFiltersBtn.addEventListener('click', function() {
        document.getElementById('search').value = '';
        document.getElementById('filter-tipo').value = '';
        document.getElementById('filter-date').value = '';
        
        // Submit del form per applicare il reset
        searchForm.submit();
    });
}); 