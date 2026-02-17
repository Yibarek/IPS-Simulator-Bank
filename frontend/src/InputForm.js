   const form = document.getElementById('checkout-form');
        const steps = form.querySelectorAll('.form-step');
        const headers = document.querySelectorAll('.step-item');
        const progressBar = document.querySelector('.progress-indicator');
        const notification = document.getElementById('notification');
        
        const summaryShippingInfo = document.getElementById('summary-shipping-info');
        const summaryPaymentInfo = document.getElementById('summary-payment-info');

        let currentStep = 0;

        function showStep(stepIndex) {
            steps.forEach((step, index) => {
                step.classList.remove('active');
                if (index === stepIndex) {
                    step.classList.add('active');
                }
            });
            headers.forEach((header, index) => {
                header.classList.remove('active', 'completed');
                if (index < stepIndex) {
                    header.classList.add('completed');
                } else if (index === stepIndex) {
                    header.classList.add('active');
                }
            });
            const progress = (stepIndex / (steps.length - 1)) * 100;
            progressBar.style.width = `${progress}%`;
        }

        function showNotification(message) {
            notification.textContent = message;
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }

        function updateReviewDetails() {
            const fullName = document.getElementById('fullName').value;
            const address = document.getElementById('address').value;
            const city = document.getElementById('city').value;
            const zipCode = document.getElementById('zipCode').value;

            const cardNumber = document.getElementById('cardNumber').value;
            
            const reviewShipping = document.getElementById('review-shipping');
            reviewShipping.innerHTML = `
                ${fullName}<br>
                ${address}<br>
                ${city}, ${zipCode}
            `;
            summaryShippingInfo.textContent = `${fullName}, ${address}, ${city}, ${zipCode}`;

            const reviewPayment = document.getElementById('review-payment');
            const lastFourDigits = cardNumber.slice(-4);
            reviewPayment.textContent = `Card ending in **** ${lastFourDigits}`;
            summaryPaymentInfo.textContent = `Card ending in **** ${lastFourDigits}`;
        }

        form.addEventListener('click', (e) => {
            if (e.target.matches('.next-btn')) {
                if (currentStep === 0) {
                    const fullName = document.getElementById('fullName').value;
                    const address = document.getElementById('address').value;
                    if (!fullName || !address) {
                        showNotification('Please fill out all shipping fields.');
                        return;
                    }
                }
                
                if (currentStep < steps.length - 1) {
                    currentStep++;
                    if (currentStep === 2) {
                        updateReviewDetails();
                    }
                    showStep(currentStep);
                }
            } else if (e.target.matches('.prev-btn')) {
                if (currentStep > 0) {
                    currentStep--;
                    showStep(currentStep);
                }
            }
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            showNotification('Purchase Complete!');
            setTimeout(() => {
                location.reload();
            }, 2000);
        });

        document.addEventListener('DOMContentLoaded', () => {
            showStep(0);
        });

        