document.addEventListener('DOMContentLoaded', function() {
    // Initialize date field with current date
    const today = new Date();
    document.getElementById('testDate').valueAsDate = today;
    
    // Get current time (hours and minutes only)
    const hours = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    document.getElementById('testTime').value = `${hours}:${minutes}`;
    
    // Customer data management
    let savedCustomers = JSON.parse(localStorage.getItem('savedCustomers') || '[]');
    
    // Create a datalist for customer autocomplete
    const customerDatalist = document.createElement('datalist');
    customerDatalist.id = 'customerList';
    document.body.appendChild(customerDatalist);
    
    // Add the datalist to the customer name input
    const customerNameInput = document.getElementById('customerName');
    customerNameInput.setAttribute('list', 'customerList');
    
    // Populate datalist with saved customers
    function updateCustomerDatalist() {
        customerDatalist.innerHTML = '';
        savedCustomers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.name;
            option.setAttribute('data-email', customer.email);
            option.setAttribute('data-phone', customer.phone);
            option.setAttribute('data-company', customer.company);
            option.setAttribute('data-address', customer.address);
            option.setAttribute('data-city', customer.city);
            option.setAttribute('data-state', customer.state);
            option.setAttribute('data-zip', customer.zip);
            customerDatalist.appendChild(option);
        });
    }
    
    updateCustomerDatalist();
    
    // Fill in customer details when a name is selected
    customerNameInput.addEventListener('change', function() {
        const selectedName = this.value;
        const customer = savedCustomers.find(c => c.name === selectedName);
        
        if (customer) {
            document.getElementById('customerEmail').value = customer.email || '';
            document.getElementById('customerPhone').value = customer.phone || '';
            document.getElementById('customerCompany').value = customer.company || '';
            document.getElementById('testAddress').value = customer.address || '';
            document.getElementById('testCity').value = customer.city || '';
            document.getElementById('testState').value = customer.state || '';
            document.getElementById('testZip').value = customer.zip || '';
        }
    });
    
    // Save customer data when form is submitted
    function saveCustomerData() {
        const customerName = document.getElementById('customerName').value;
        if (!customerName) return;
        
        const customerData = {
            name: customerName,
            email: document.getElementById('customerEmail').value,
            phone: document.getElementById('customerPhone').value,
            company: document.getElementById('customerCompany').value,
            address: document.getElementById('testAddress').value,
            city: document.getElementById('testCity').value,
            state: document.getElementById('testState').value,
            zip: document.getElementById('testZip').value,
            lastUsed: new Date().toISOString()
        };
        
        // Check if customer already exists
        const existingIndex = savedCustomers.findIndex(c => c.name === customerName);
        
        if (existingIndex >= 0) {
            // Update existing customer
            savedCustomers[existingIndex] = customerData;
        } else {
            // Add new customer
            savedCustomers.push(customerData);
        }
        
        // Sort by most recently used
        savedCustomers.sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed));
        
        // Keep only the most recent 50 customers to prevent localStorage from getting too large
        if (savedCustomers.length > 50) {
            savedCustomers = savedCustomers.slice(0, 50);
        }
        
        // Save to localStorage
        localStorage.setItem('savedCustomers', JSON.stringify(savedCustomers));
        
        // Update the datalist
        updateCustomerDatalist();
    }

    // Initialize modal
    const previewModal = new bootstrap.Modal(document.getElementById('previewModal'));
    
    // Generate unique report ID
    function generateReportId() {
        return 'HYDRO-' + Date.now().toString(36).toUpperCase() + 
               Math.random().toString(36).substring(2, 7).toUpperCase();
    }

    // Format date for display
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Format date and time together
    function formatDateTime(dateString, timeString) {
        const date = new Date(dateString);
        const [hours, minutes] = timeString.split(':');
        date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // No longer using QR code generation

    // Populate report preview with form data
    function populateReportPreview() {
        // Get form values
        const customerName = document.getElementById('customerName').value;
        const customerEmail = document.getElementById('customerEmail').value;
        const customerPhone = document.getElementById('customerPhone').value;
        const customerCompany = document.getElementById('customerCompany').value;
        
        const testAddress = document.getElementById('testAddress').value;
        const testCity = document.getElementById('testCity').value;
        const testState = document.getElementById('testState').value;
        const testZip = document.getElementById('testZip').value;
        
        const testDate = document.getElementById('testDate').value;
        const testTime = document.getElementById('testTime').value;
        const testDuration = document.getElementById('testDuration').value;
        const testDescription = document.getElementById('testDescription').value;
        const systemTested = document.getElementById('systemTested').value;
        const testMethod = document.getElementById('testMethod').value;
        
        const testResult = document.querySelector('input[name="testResult"]:checked').value;
        const testNotes = document.getElementById('testNotes').value;
        
        // Get the appropriate conclusion based on test result
        const passConclusion = document.getElementById('passConclusion').value;
        const failConclusion = document.getElementById('failConclusion').value;
        const conclusion = testResult === 'pass' ? passConclusion : failConclusion;
        
        // Get certification text
        const certification = document.getElementById('certification').value;
        
        // Generate report ID and timestamp
        const reportId = generateReportId();
        const generatedTimestamp = new Date().toLocaleString();
        
        // Format test result display
        let resultDisplay = '';
        if (testResult === 'pass') {
            resultDisplay = '<span class="text-success">PASS</span> - No leaks or pressure loss detected';
        } else {
            resultDisplay = '<span class="text-danger">FAIL</span> - Leaks or pressure loss detected';
        }
        
        // Clone the template
        const template = document.getElementById('reportTemplate').cloneNode(true);
        template.style.display = 'block';
        
        // Populate the template with data
        template.querySelector('#reportDate').textContent = formatDate(testDate);
        template.querySelector('#reportCustomerName').textContent = customerName;
        template.querySelector('#reportCustomerEmail').textContent = customerEmail;
        template.querySelector('#reportCustomerPhone').textContent = customerPhone;
        template.querySelector('#reportCustomerCompany').textContent = customerCompany;
        
        template.querySelector('#reportAddress').textContent = testAddress;
        template.querySelector('#reportCityStateZip').textContent = `${testCity}, ${testState} ${testZip}`;
        
        template.querySelector('#reportDateTime').textContent = formatDateTime(testDate, testTime);
        template.querySelector('#reportTestDuration').textContent = testDuration;
        template.querySelector('#reportSystemTested').textContent = systemTested;
        template.querySelector('#reportTestMethod').textContent = testMethod;
        template.querySelector('#reportDescription').textContent = testDescription;
        
        template.querySelector('#reportResult').innerHTML = resultDisplay;
        template.querySelector('#reportConclusion').textContent = conclusion;
        template.querySelector('#reportNotes').textContent = testNotes;
        
        template.querySelector('#reportCertification').textContent = certification;
        
        // No longer using QR code generation
        
        // Clear previous preview and add the new one
        const previewContainer = document.getElementById('reportPreview');
        previewContainer.innerHTML = '';
        previewContainer.appendChild(template);
        
        // Store report data in session storage
        const reportData = {
            reportId: reportId,
            customerName: customerName,
            customerEmail: customerEmail,
            customerPhone: customerPhone,
            customerCompany: customerCompany,
            testAddress: testAddress,
            testCity: testCity,
            testState: testState,
            testZip: testZip,
            testDate: testDate,
            testTime: testTime,
            testDuration: testDuration,
            systemTested: systemTested,
            testMethod: testMethod,
            testDescription: testDescription,
            testResult: testResult,
            conclusion: conclusion,
            testNotes: testNotes,
            certification: certification,
            generatedTimestamp: generatedTimestamp
        };
        
        sessionStorage.setItem('currentReport', JSON.stringify(reportData));
        
        return reportData;
    }

    // Preview report button
    document.getElementById('previewReport').addEventListener('click', function() {
        if (!validateForm()) return;
        
        // Save customer data when previewing
        saveCustomerData();
        
        populateReportPreview();
        previewModal.show();
    });

    // Form validation
    function validateForm() {
        const form = document.getElementById('hydroTestForm');
        const requiredFields = form.querySelectorAll('[required]');
        let valid = true;
        
        requiredFields.forEach(field => {
            if (!field.value) {
                field.classList.add('is-invalid');
                valid = false;
            } else {
                field.classList.remove('is-invalid');
            }
        });
        
        return valid;
    }

    // Generate PDF directly
    document.getElementById('generatePDF').addEventListener('click', function() {
        if (!validateForm()) return;
        
        // Save customer data when generating PDF
        saveCustomerData();
        
        const reportData = populateReportPreview();
        generatePDF(reportData);
    });

    // Generate PDF from preview modal
    document.getElementById('downloadPDF').addEventListener('click', function() {
        const reportData = JSON.parse(sessionStorage.getItem('currentReport'));
        generatePDF(reportData);
    });

    // Generate PDF function
    function generatePDF(reportData) {
        const reportElement = document.getElementById('reportPreview').cloneNode(true);
        
        // Ensure the element is visible for html2canvas
        reportElement.style.display = 'block';
        document.body.appendChild(reportElement);
        
        // Ensure logo is loaded before generating PDF
        const logoImg = reportElement.querySelector('#companyLogo');
        if (logoImg) {
            logoImg.onload = function() {
                generatePDFWithCanvas(reportElement, reportData);
            };
            
            // If logo is already loaded or fails to load, proceed after a short delay
            setTimeout(function() {
                generatePDFWithCanvas(reportElement, reportData);
            }, 500);
        } else {
            generatePDFWithCanvas(reportElement, reportData);
        }
    }
    
    // Helper function to generate PDF once logo is loaded
    function generatePDFWithCanvas(reportElement, reportData) {
        
        html2canvas(reportElement, {
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true,
            imageTimeout: 2000
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            
            // Create PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 10;
            
            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            
            // Download the PDF
            const fileName = `Click_Plumbing_Hydrostatic_Test_Report_${reportData.reportId}.pdf`;
            pdf.save(fileName);
            
            // Clean up
            document.body.removeChild(reportElement);
        }).catch(error => {
            console.error('Error generating PDF:', error);
            alert('There was an error generating the PDF. Please try again.');
            document.body.removeChild(reportElement);
        });
    }

    // Custom confirmation modal for reset form
    function showResetConfirmation() {
        // Create modal elements if they don't exist
        let resetModal = document.getElementById('resetConfirmModal');
        
        if (!resetModal) {
            resetModal = document.createElement('div');
            resetModal.id = 'resetConfirmModal';
            resetModal.className = 'modal fade';
            resetModal.setAttribute('tabindex', '-1');
            resetModal.setAttribute('aria-labelledby', 'resetConfirmModalLabel');
            resetModal.setAttribute('aria-hidden', 'true');
            
            resetModal.innerHTML = `
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header bg-warning">
                            <h5 class="modal-title" id="resetConfirmModalLabel">Confirm Reset</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="d-flex align-items-center mb-3">
                                <i class="fas fa-exclamation-triangle text-warning me-3" style="font-size: 2rem;"></i>
                                <p class="mb-0">Are you sure you want to reset the form?<br><strong>All entered data will be lost.</strong></p>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-danger" id="confirmResetBtn">Yes, Reset Form</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(resetModal);
            
            // Add event listener to the confirm button
            document.getElementById('confirmResetBtn').addEventListener('click', function() {
                // Reset the form
                document.getElementById('hydroTestForm').reset();
                
                // Reset date and time to current
                document.getElementById('testDate').valueAsDate = new Date();
                const now = new Date();
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                document.getElementById('testTime').value = `${hours}:${minutes}`;
                
                // Clear any validation styling
                const invalidFields = document.querySelectorAll('.is-invalid');
                invalidFields.forEach(field => field.classList.remove('is-invalid'));
                
                // Hide the modal
                const resetModalInstance = bootstrap.Modal.getInstance(resetModal);
                resetModalInstance.hide();
            });
        }
        
        // Show the modal
        const resetModalInstance = new bootstrap.Modal(resetModal);
        resetModalInstance.show();
    }
    
    // Reset form button
    document.getElementById('resetForm').addEventListener('click', function() {
        showResetConfirmation();
    });

    // Load previous report data if it exists in session storage
    const savedReport = sessionStorage.getItem('currentReport');
    if (savedReport) {
        const reportData = JSON.parse(savedReport);
        
        // Populate form fields with saved data
        document.getElementById('customerName').value = reportData.customerName || '';
        document.getElementById('customerEmail').value = reportData.customerEmail || '';
        document.getElementById('customerPhone').value = reportData.customerPhone || '';
        document.getElementById('customerCompany').value = reportData.customerCompany || '';
        
        document.getElementById('testAddress').value = reportData.testAddress || '';
        document.getElementById('testCity').value = reportData.testCity || '';
        document.getElementById('testState').value = reportData.testState || '';
        document.getElementById('testZip').value = reportData.testZip || '';
        
        document.getElementById('testDate').value = reportData.testDate || '';
        document.getElementById('testTime').value = reportData.testTime || '';
        document.getElementById('testDuration').value = reportData.testDuration || '';
        document.getElementById('testDescription').value = reportData.testDescription || '';
        
        if (reportData.testResult) {
            document.querySelector(`input[name="testResult"][value="${reportData.testResult}"]`).checked = true;
        }
        
        document.getElementById('testNotes').value = reportData.testNotes || '';
    }
});
