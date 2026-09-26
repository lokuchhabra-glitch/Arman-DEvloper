(function () {
    const membersPath = '/members.html';

    function requestAccess() {
        return new Promise(resolve => {
            document.documentElement.classList.add('pin-gate-active');

            const overlay = document.createElement('div');
            overlay.className = 'pin-gate-overlay';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.setAttribute('aria-labelledby', 'pinGateTitle');
            overlay.innerHTML = `
                <section class="pin-gate-panel">
                    <div class="pin-gate-icon"><i class="fa-solid fa-lock" aria-hidden="true"></i></div>
                    <p class="pin-gate-eyebrow">MEMBER ACCESS</p>
                    <h1 id="pinGateTitle">Enter passcode</h1>
                    <p class="pin-gate-hint">Type your 4-digit PIN to continue</p>
                    <div class="pin-gate-dots" aria-label="No digits entered">
                        <span class="pin-gate-dot"></span>
                        <span class="pin-gate-dot"></span>
                        <span class="pin-gate-dot"></span>
                        <span class="pin-gate-dot"></span>
                    </div>
                    <p class="pin-gate-error" aria-live="polite"></p>
                    <div class="pin-gate-keypad" aria-label="Passcode keypad">
                        <button type="button" data-pin-digit="1">1</button>
                        <button type="button" data-pin-digit="2">2</button>
                        <button type="button" data-pin-digit="3">3</button>
                        <button type="button" data-pin-digit="4">4</button>
                        <button type="button" data-pin-digit="5">5</button>
                        <button type="button" data-pin-digit="6">6</button>
                        <button type="button" data-pin-digit="7">7</button>
                        <button type="button" data-pin-digit="8">8</button>
                        <button type="button" data-pin-digit="9">9</button>
                        <span aria-hidden="true"></span>
                        <button type="button" data-pin-digit="0">0</button>
                        <button type="button" data-pin-delete aria-label="Delete last digit"><i class="fa-solid fa-delete-left" aria-hidden="true"></i></button>
                    </div>
                    <button type="button" class="pin-gate-cancel">Cancel</button>
                </section>
            `;

            document.documentElement.appendChild(overlay);

            const panel = overlay.querySelector('.pin-gate-panel');
            const dots = Array.from(overlay.querySelectorAll('.pin-gate-dot'));
            const dotsDisplay = overlay.querySelector('.pin-gate-dots');
            const error = overlay.querySelector('.pin-gate-error');
            let enteredPin = '';
            let complete = false;

            function finish(authorized) {
                if (complete) return;
                complete = true;
                document.removeEventListener('keydown', handleKeydown);
                overlay.remove();
                document.documentElement.classList.remove('pin-gate-active');
                resolve(authorized);
            }

            function renderDigits() {
                dots.forEach((dot, index) => dot.classList.toggle('filled', index < enteredPin.length));
                dotsDisplay.setAttribute('aria-label', `${enteredPin.length} of 4 digits entered`);
            }

            function submitPin() {
                if (enteredPin.length !== 4) return;
                if (enteredPin === '9835') {
                    finish(true);
                    return;
                }

                error.textContent = 'Incorrect passcode. Try again.';
                panel.classList.remove('pin-gate-shake');
                void panel.offsetWidth;
                panel.classList.add('pin-gate-shake');
                enteredPin = '';
                renderDigits();
            }

            function addDigit(digit) {
                if (enteredPin.length >= 4) return;
                error.textContent = '';
                enteredPin += digit;
                renderDigits();
                submitPin();
            }

            function handleKeydown(event) {
                if (/^[0-9]$/.test(event.key)) {
                    addDigit(event.key);
                } else if (event.key === 'Backspace') {
                    enteredPin = enteredPin.slice(0, -1);
                    error.textContent = '';
                    renderDigits();
                } else if (event.key === 'Escape') {
                    finish(false);
                }
            }

            overlay.querySelectorAll('[data-pin-digit]').forEach(button => {
                button.addEventListener('click', () => addDigit(button.dataset.pinDigit));
            });
            overlay.querySelector('[data-pin-delete]').addEventListener('click', () => {
                enteredPin = enteredPin.slice(0, -1);
                error.textContent = '';
                renderDigits();
            });
            overlay.querySelector('.pin-gate-cancel').addEventListener('click', () => finish(false));
            document.addEventListener('keydown', handleKeydown);
            overlay.querySelector('[data-pin-digit="1"]').focus();
        });
    }

    if (window.location.pathname.toLowerCase().endsWith(membersPath)) {
        requestAccess().then(authorized => {
            if (!authorized) window.location.replace('index.html');
        });

        window.addEventListener('pageshow', function (event) {
            if (event.persisted) {
                requestAccess().then(authorized => {
                    if (!authorized) window.location.replace('index.html');
                });
            }
        });
        return;
    }

    document.addEventListener('click', function (event) {
        const link = event.target.closest('a[href]');
        if (!link || !new URL(link.href, window.location.href).pathname.toLowerCase().endsWith(membersPath)) {
            return;
        }

        event.preventDefault();
        requestAccess().then(authorized => {
            if (authorized) window.location.assign(link.href);
        });
    }, true);
})();