
const validUsers = {
    '2024001': 'password',
    '2024002': 'student123',
    'admin': 'admin123'
};

let dynamicSlots = {};

const defaultLibrarySlots = [
    { time: '9:00 AM - 10:00 AM', seats: 3 },
    { time: '10:00 AM - 11:00 AM', seats: 3 },
    { time: '11:00 AM - 12:00 PM', seats: 3 },
    { time: '1:00 PM - 2:00 PM', seats: 3 },
    { time: '2:00 PM - 3:00 PM', seats: 3 },
    { time: '3:00 PM - 4:00 PM', seats: 3 },
    { time: '4:00 PM - 5:00 PM', seats: 3 },
    { time: '5:00 PM - 6:00 PM', seats: 3 }
];

const defaultCourtSlots = [
    { time: '6:00 AM - 7:00 AM', available: true },
    { time: '7:00 AM - 8:00 AM', available: true },
    { time: '8:00 AM - 9:00 AM', available: true },
    { time: '9:00 AM - 10:00 AM', available: true },
    { time: '5:00 PM - 6:00 PM', available: true },
    { time: '6:00 PM - 7:00 PM', available: true },
    { time: '7:00 PM - 8:00 PM', available: true },
    { time: '8:00 PM - 9:00 PM', available: true }
];

const mainCafeteria = [
    { name: 'Burger Combo', price: 250 },
    { name: 'Pizza Slice', price: 180 },
    { name: 'Pasta Bowl', price: 220 },
    { name: 'Sandwich', price: 150 },
    { name: 'Fries', price: 100 },
    { name: 'Soft Drink', price: 60 }
];

const foodCourt = [
    { name: 'Biryani', price: 280 },
    { name: 'Chicken Karahi', price: 350 },
    { name: 'Noodles', price: 200 },
    { name: 'Wrap', price: 180 },
    { name: 'Juice', price: 80 },
    { name: 'Tea/Coffee', price: 50 }
];

let currentUser = null;
let selectedSport = 'basketball'; 
let selectedCafeteriaItems = []; 
let cafeteriaOrderHistory = []; 
let bookingHistory = []; 
let orderCounter = 0; 


function loadState() {
    const savedSlots = localStorage.getItem('dynamicSlots');
    const savedHistory = localStorage.getItem('bookingHistory');
    const savedCafHistory = localStorage.getItem('cafeteriaOrderHistory');
    const savedCounter = localStorage.getItem('orderCounter');

    if (savedSlots) dynamicSlots = JSON.parse(savedSlots);
    if (savedHistory) bookingHistory = JSON.parse(savedHistory);
    if (savedCafHistory) cafeteriaOrderHistory = JSON.parse(savedCafHistory);
    if (savedCounter) orderCounter = parseInt(savedCounter);
}

function saveState() {
    localStorage.setItem('dynamicSlots', JSON.stringify(dynamicSlots));
    localStorage.setItem('bookingHistory', JSON.stringify(bookingHistory));
    localStorage.setItem('cafeteriaOrderHistory', JSON.stringify(cafeteriaOrderHistory));
    localStorage.setItem('orderCounter', orderCounter);
}

function getOrCreateSlots(date) {
    if (!dynamicSlots[date]) {
        dynamicSlots[date] = {
            library: JSON.parse(JSON.stringify(defaultLibrarySlots)),
            courts: {
                basketball: JSON.parse(JSON.stringify(defaultCourtSlots)),
                badminton: JSON.parse(JSON.stringify(defaultCourtSlots))
            }
        };
    }
    return dynamicSlots[date];
}

function formatDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

function generateOrderID() {
    orderCounter++;
    return `#ORD${String(orderCounter).padStart(3, '0')}`;
}

const today = new Date();
const todayString = formatDate(today);

document.addEventListener('DOMContentLoaded', () => {
    loadState(); 
    
    document.getElementById('consultDate').setAttribute('min', todayString);
    document.getElementById('libraryDate').setAttribute('min', todayString);
    document.getElementById('courtDate').setAttribute('min', todayString);
    
    showPage('login');
});


document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const enrollment = document.getElementById('enrollment').value.trim();
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('loginError');
    
    if (validUsers[enrollment] && validUsers[enrollment] === password) {
        currentUser = enrollment;
        errorMsg.classList.remove('show');
        showPage('dashboard');
    } else {
        errorMsg.textContent = '❌ Invalid enrollment number or password';
        errorMsg.classList.add('show');
    }
});


function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    document.getElementById(pageName + 'Page').classList.add('active');
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageName) {
            link.classList.add('active');
        }
    });
    
    const nav = document.getElementById('mainNav');
    const footer = document.getElementById('mainFooter');
    
    if (pageName === 'login') {
        nav.classList.remove('active');
        footer.classList.remove('active');
    } else {
        nav.classList.add('active');
        footer.classList.add('active');
    }
    
    if (pageName === 'library') {
        document.getElementById('libraryDate').value = todayString;
        document.getElementById('libraryConfirmation').classList.remove('show');
        displayLibrarySlots(todayString);
    } else if (pageName === 'court') {
        document.getElementById('courtDate').value = todayString;
        document.getElementById('courtConfirmation').classList.remove('show');
        document.querySelectorAll('.sport-btn').forEach(b => b.classList.remove('selected'));
        const defaultSportBtn = document.querySelector(`.sport-btn[data-sport="${selectedSport}"]`);
        if (defaultSportBtn) defaultSportBtn.classList.add('selected');
        displayCourtSlots(todayString, selectedSport);
    } else if (pageName === 'cafeteria') {
        document.getElementById('cafeteriaConfirmation').classList.remove('show');
        displayCafeteriaMenus();
        updateOrderSummary();
        displayCafeteriaOrderHistory();
    } else if (pageName === 'mybookings') {
        displayAllBookings();
    }
    saveState(); 
}

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const page = this.getAttribute('data-page');
        showPage(page);
    });
});

document.querySelectorAll('.module-card').forEach(card => {
    card.addEventListener('click', function() {
        const module = this.getAttribute('data-module');
        showPage(module);
    });
});

document.getElementById('logoutBtn').addEventListener('click', function() {
    currentUser = null;
    selectedCafeteriaItems = []; 
    document.getElementById('loginForm').reset();
    document.querySelectorAll('.confirmation-card').forEach(conf => {
        conf.classList.remove('show');
    });
    showPage('login');
});


document.getElementById('libraryDate').addEventListener('change', function() {
    displayLibrarySlots(this.value);
});

function displayLibrarySlots(date) {
    if (new Date(date) < new Date(todayString)) {
        document.getElementById('librarySlots').innerHTML = '<p class="empty-state">Cannot book slots for a past date.</p>';
        return;
    }
    
    const slots = getOrCreateSlots(date).library;
    const librarySlotContainer = document.getElementById('librarySlots');
    librarySlotContainer.innerHTML = '';

    if (slots.length === 0) {
        librarySlotContainer.innerHTML = '<p class="empty-state">No slots available for this date.</p>';
        return;
    }
    
    slots.forEach((slot, index) => {
        const isBooked = slot.seats === 0;
        
        const slotCard = document.createElement('div');
        slotCard.className = `slot-card ${isBooked ? 'booked' : ''}`;
        slotCard.innerHTML = `
            <div class="slot-time">${slot.time}</div>
            <div class="slot-seats">${isBooked ? '❌ Fully Booked' : `✅ ${slot.seats} rooms available`}</div>
        `;        
        if (!isBooked) {
            slotCard.addEventListener('click', function() {
                bookLibrarySlot(date, index);
            });
        }
        
        librarySlotContainer.appendChild(slotCard);
    });
    
    document.getElementById('libraryConfirmation').classList.remove('show');
    saveState(); 
}

function bookLibrarySlot(date, index) {
    const slots = getOrCreateSlots(date).library;
    const slot = slots[index];
    
    if (slot.seats === 0) return;

    slots[index].seats--;
    
    const roomNumber = Math.floor(Math.random() * 20) + 1;
    const bookingId = `#LIB${Math.floor(Math.random() * 9000) + 1000}`;
    
    const bookingDetails = {
        type: 'Library',
        id: bookingId,
        date: date,
        time: slot.time,
        resource: `Room ${roomNumber}`,
        cancellable: true,
        slotIndex: index,
        slotDate: date,
        originalSeats: slot.seats + 1
    };
    bookingHistory.unshift(bookingDetails);
    
    displayLibrarySlots(date);
    
    const confirmation = document.getElementById('libraryConfirmation');
    const details = document.getElementById('libraryDetails');
    
    details.innerHTML = `
        <p><strong>📚 Booking Type:</strong> Group Study Room</p>
        <p><strong>🏢 Room Number:</strong> Room ${roomNumber}</p>
        <p><strong>🪑 Capacity:</strong> 4-6 seats</p>
        <p><strong>🕐 Time Slot:</strong> ${slot.time}</p>
        <p><strong>📅 Date:</strong> ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p><strong>🎫 Booking ID:</strong> ${bookingId}</p>
    `;    
    confirmation.classList.add('show');
    
    setTimeout(() => {
        confirmation.classList.remove('show');
    }, 8000);
}


const courtOptions = document.querySelectorAll('.sport-btn');

document.getElementById('courtDate').addEventListener('change', function() {
    const date = this.value;
    if (selectedSport) {
        displayCourtSlots(date, selectedSport);
    } else {
        document.getElementById('courtSlots').innerHTML = '<p class="empty-state">Select a sport to view slots.</p>';
    }
});

courtOptions.forEach(btn => {
    btn.addEventListener('click', function() {
        courtOptions.forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
        selectedSport = this.getAttribute('data-sport');
        
        const date = document.getElementById('courtDate').value;
        if (date) {
            displayCourtSlots(date, selectedSport);
        } else {
            document.getElementById('courtSlots').innerHTML = '<p class="empty-state">Select a date to view slots.</p>';
        }
    });
});

function displayCourtSlots(date, sport) {
    if (!date || !sport) {
        document.getElementById('courtSlots').innerHTML = '<p class="empty-state">Select a date and sport to view slots.</p>';
        return;
    }

    if (new Date(date) < new Date(todayString)) {
        document.getElementById('courtSlots').innerHTML = '<p class="empty-state">Cannot book courts for a past date.</p>';
        return;
    }
    
    const slots = getOrCreateSlots(date).courts[sport];
    const courtSlotContainer = document.getElementById('courtSlots');
    courtSlotContainer.innerHTML = '';
    
    if (!slots || slots.length === 0) {
        courtSlotContainer.innerHTML = '<p class="empty-state">No slots available for this date/sport.</p>';
        return;
    }
    
    slots.forEach((slot, index) => {
        const isBooked = !slot.available;
        
        const slotCard = document.createElement('div');
        slotCard.className = `slot-card ${isBooked ? 'booked' : ''}`;
        slotCard.innerHTML = `
            <div class="slot-time">${slot.time}</div>
            <div class="slot-seats">${isBooked ? '❌ Booked' : '✅ Available'}</div>
        `;        
        if (!isBooked) {
            slotCard.addEventListener('click', function() {
                bookCourtSlot(date, sport, index);
            });
        }
        
        courtSlotContainer.appendChild(slotCard);
    });
    
    document.getElementById('courtConfirmation').classList.remove('show');
    saveState(); 
}

function bookCourtSlot(date, sport, index) {
    const slots = getOrCreateSlots(date).courts[sport];
    const slot = slots[index];

    if (!slot.available) return;

    slots[index].available = false; 
    
    const sportName = sport === 'basketball' ? 'Basketball 🏀' : 'Badminton 🏸';
    const courtNumber = Math.floor(Math.random() * 5) + 1;
    const bookingId = `#CRT${Math.floor(Math.random() * 9000) + 1000}`;

    const bookingDetails = {
        type: 'Court',
        id: bookingId,
        date: date,
        time: slot.time,
        resource: `${sportName} Court ${courtNumber}`,
        cancellable: true,
        slotIndex: index,
        slotDate: date,
        slotSport: sport
    };

    bookingHistory.unshift(bookingDetails);

    displayCourtSlots(date, sport); 
    
    const confirmation = document.getElementById('courtConfirmation');
    const details = document.getElementById('courtDetails');
    
    details.innerHTML = `
        <p><strong>🏅 Sport:</strong> ${sportName}</p>
        <p><strong>🏟️ Court Number:</strong> Court ${courtNumber}</p>
        <p><strong>🕐 Time Slot:</strong> ${slot.time}</p>
        <p><strong>📅 Date:</strong> ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p><strong>🎫 Booking ID:</strong> ${bookingId}</p>
        <p style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--bg-light); font-size: 0.9rem; color: var(--gray);">
            <em>⏰ Please arrive 10 minutes before your slot. Bring your student ID.</em>
        </p>
    `;    
    confirmation.classList.add('show');
    
    setTimeout(() => {
        confirmation.classList.remove('show');
    }, 8000);
}


function displayCafeteriaMenus() {
    const mainMenu = document.getElementById('mainCafMenu');
    const foodCourtMenuEl = document.getElementById('foodCourtMenu');
    
    const renderMenu = (menuArray, containerEl, cafeteriaName) => {
        containerEl.innerHTML = '';
        menuArray.forEach((item, index) => {
            const itemId = `${cafeteriaName}-${index}`;
            const existingItem = selectedCafeteriaItems.find(i => i.id === itemId);
            const quantity = existingItem ? existingItem.quantity : 0;
            
            const menuItem = document.createElement('div');
            menuItem.className = `menu-item ${quantity > 0 ? 'selected' : ''}`;
            menuItem.setAttribute('data-cafeteria', cafeteriaName);
            menuItem.setAttribute('data-index', index);
            
            const quantityBadge = quantity > 0 ? `<div class="menu-quantity">x${quantity}</div>` : '';
            
            menuItem.innerHTML = `
                <div class="menu-item-name">${item.name}</div>
                <div class="menu-item-price">Rs. ${item.price}</div>
                ${quantityBadge}
            `;        
            

            menuItem.addEventListener('click', function() {
                updateMenuItemQuantity(itemId, item, cafeteriaName, 1);
            });
            
            
            containerEl.appendChild(menuItem);
        });
    };
    
    renderMenu(mainCafeteria, mainMenu, 'main');
    renderMenu(foodCourt, foodCourtMenuEl, 'foodcourt');
}

function updateMenuItemQuantity(itemId, itemData, cafeteriaName, change) {
    let itemIndex = selectedCafeteriaItems.findIndex(i => i.id === itemId);

    if (itemIndex > -1) {
        
        selectedCafeteriaItems[itemIndex].quantity += change;
        
        if (selectedCafeteriaItems[itemIndex].quantity <= 0) {
           
            selectedCafeteriaItems.splice(itemIndex, 1);
        }
    } else if (change > 0) {
  
        selectedCafeteriaItems.push({
            id: itemId,
            name: itemData.name,
            price: itemData.price,
            cafeteria: cafeteriaName,
            quantity: 1
        });
    }

    displayCafeteriaMenus();
    updateOrderSummary();
}

function updateOrderSummary() {
    const selectedItemsEl = document.getElementById('selectedItems');
    const orderTotalEl = document.getElementById('orderTotal');
    
    if (selectedCafeteriaItems.length === 0) {
        selectedItemsEl.innerHTML = '<p class="empty-state">No items selected</p>';
        orderTotalEl.innerHTML = '';
        return;
    }
    
    selectedItemsEl.innerHTML = selectedCafeteriaItems.map((item, index) => `
        <div class="selected-item">
            <div class="item-details">
                <span class="selected-item-name">${item.name}</span>
                <span class="selected-item-price">Rs. ${item.price * item.quantity}</span>
            </div>
            
            <div class="item-actions">
                <button class="quantity-btn remove" data-action="-1" data-id="${item.id}">—</button>
                <span class="item-quantity-display">x${item.quantity}</span>
                <button class="quantity-btn add" data-action="1" data-id="${item.id}">+</button>
            </div>
        </div>
    `).join('');    
    
    const totalPrice = selectedCafeteriaItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    orderTotalEl.innerHTML = `Total: Rs. ${totalPrice}`;

    document.querySelectorAll('.quantity-btn').forEach(button => {
        button.addEventListener('click', function() {
            const change = parseInt(this.getAttribute('data-action'));
            const itemId = this.getAttribute('data-id');
            
            
            const itemData = mainCafeteria.find(i => `main-${mainCafeteria.indexOf(i)}` === itemId) || 
                             foodCourt.find(i => `foodcourt-${foodCourt.indexOf(i)}` === itemId);
                             

            const cafeteriaName = itemId.split('-')[0];
            
            updateMenuItemQuantity(itemId, itemData, cafeteriaName, change); 
        });
    });
}

document.getElementById('orderBtn').addEventListener('click', function() {
    if (selectedCafeteriaItems.length === 0) {
        alert('⚠️ Please select at least one item before placing your order.');
        return;
    }
    
    const totalPrice = selectedCafeteriaItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const pickupMinutes = Math.floor(Math.random() * 6) + 20;
    const currentTime = new Date();
    const estimatedTime = new Date(currentTime.getTime() + pickupMinutes * 60000);
    

    const orderNumber = generateOrderID();
    
    const itemsForHistory = selectedCafeteriaItems.map(i => ({ 
        name: i.name, 
        price: i.price, 
        quantity: i.quantity 
    }));
    
    const cafOrderHistoryObject = {
        orderNumber: orderNumber,
        items: itemsForHistory,
        total: totalPrice,
        pickupTime: estimatedTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        date: new Date().toLocaleDateString()
    };
    
    cafeteriaOrderHistory.unshift(cafOrderHistoryObject); 
    
   
    const bookingDetailsForMyBookings = {
        type: 'Cafeteria',
        id: orderNumber,
        date: formatDate(new Date()),
        time: cafOrderHistoryObject.pickupTime,
        resource: `Pre-Order (${itemsForHistory.length} items)`,
        cancellable: false, 
        orderSummary: itemsForHistory,
    };
    bookingHistory.unshift(bookingDetailsForMyBookings);
    
    saveState(); 

    const confirmation = document.getElementById('cafeteriaConfirmation');
    const details = document.getElementById('cafeteriaDetails');
    
    let itemsList = itemsForHistory.map(item => `${item.name} (x${item.quantity}, Rs. ${item.price * item.quantity})`).join(', ');
    
    details.innerHTML = `
        <p><strong>🎫 Order Number:</strong> ${orderNumber}</p>
        <p><strong>🍽️ Items Ordered:</strong> ${itemsList}</p>
        <p><strong>💰 Total Amount:</strong> Rs. ${totalPrice}</p>
        <p><strong>⏰ Estimated Pickup Time:</strong> ${estimatedTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} (in ${pickupMinutes} minutes)</p>
        <p><strong>📅 Date:</strong> ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--bg-light); font-size: 0.9rem; color: var(--gray);">
            <em>✅ Your order is confirmed! Show this order number at the pickup counter.</em>
        </p>
    `;    
    confirmation.classList.add('show');
    
    selectedCafeteriaItems = [];
    displayCafeteriaMenus();
    updateOrderSummary();
    displayCafeteriaOrderHistory();
    
    setTimeout(() => {
        confirmation.classList.remove('show');
    }, 10000);
});

function displayCafeteriaOrderHistory() {
    const historyList = document.getElementById('historyList');
    
    if (cafeteriaOrderHistory.length === 0) {
        historyList.innerHTML = '<p class="empty-state">No previous orders</p>';
        return;
    }
    
    historyList.innerHTML = cafeteriaOrderHistory.map(order => `
        <div class="history-item">
            <div class="history-item-header">
                <span class="history-order-number">${order.orderNumber}</span>
                <span class="history-pickup-time">⏰ ${order.pickupTime}</span>
            </div>
            <div class="history-items">${order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</div>
            <div class="history-total">Total: Rs. ${order.total}</div>
        </div>
    `).join('');
}


document.getElementById('careerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const counselor = document.getElementById('counselor').value;
    const date = document.getElementById('consultDate').value;
    const time = document.getElementById('consultTime').value;
    const reason = document.getElementById('consultReason').value;
    
    const selectedDate = new Date(date);
    const todayCheck = new Date(todayString); 
    
    if (selectedDate < todayCheck) {
        alert('⚠️ Please select a future date for your appointment.');
        return;
    }
    
    const appointmentId = `#CC${Math.floor(Math.random() * 9000) + 1000}`;
    
    const bookingDetails = {
        type: 'Career',
        id: appointmentId,
        date: date,
        time: time,
        resource: `Counselor: ${counselor.split(' - ')[0]}`,
        cancellable: true
    };

    bookingHistory.unshift(bookingDetails);
    saveState(); 

    const confirmation = document.getElementById('careerConfirmation');
    const details = document.getElementById('careerDetails');
    
    details.innerHTML = `
        <p><strong>🎫 Appointment ID:</strong> ${appointmentId}</p>
        <p><strong>👨‍🏫 Counselor:</strong> ${counselor}</p>
        <p><strong>📅 Date:</strong> ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p><strong>🕐 Time:</strong> ${time}</p>
        <p><strong>📝 Reason:</strong> ${reason}</p>
        <p style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--bg-light); font-size: 0.9rem; color: var(--gray);">
            <em>✅ Your appointment has been confirmed! You will receive a confirmation email shortly. Please arrive 5 minutes before your scheduled time and bring your student ID.</em>
        </p>
    `;    
    confirmation.classList.add('show');
    
    this.reset();
    document.getElementById('consultDate').setAttribute('min', todayString); 
    
    setTimeout(() => {
        confirmation.classList.remove('show');
    }, 10000);
});


function displayAllBookings() {
    const listContainer = document.getElementById('allBookingsList');
    listContainer.innerHTML = '';

    if (bookingHistory.length === 0) {
        listContainer.innerHTML = '<p class="empty-state">You have no active facility bookings or career appointments.</p>';
        return;
    }

    bookingHistory.forEach((booking, index) => {
        const dateString = new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        let typeIcon;
        let mainInfo;
        
        if (booking.type === 'Library') {
            typeIcon = '📚';
            mainInfo = `Study Room Booking: ${booking.resource}`;
        } else if (booking.type === 'Court') {
            typeIcon = '🏀';
            mainInfo = `Court Booking: ${booking.resource}`;
        } else if (booking.type === 'Career') { 
            typeIcon = '💼';
            mainInfo = `Career Consult: ${booking.resource}`;
        } else { 
             typeIcon = '🍽️';
             mainInfo = `Cafeteria Order: ${booking.resource}`;
        }
        
        const card = document.createElement('div');
        card.className = `booking-card ${booking.type.toLowerCase()}`;
        
        const isCancellable = booking.cancellable !== false;
        
        card.innerHTML = `
            <div class="booking-details">
                <div class="booking-type">${typeIcon} ${booking.type} Booking</div>
                <div class="booking-main-info">${mainInfo}</div>
                <div class="booking-time">📅 ${dateString} 🕐 ${booking.time}</div>
                <div class="booking-id" style="font-size: 0.8rem; color: var(--gray); margin-top: 0.5rem;">ID: ${booking.id}</div>
            </div>
            ${isCancellable ? 
                `<button class="cancel-btn" data-index="${index}">Cancel</button>` : 
                `<button class="cancel-btn" disabled>Non-Refundable</button>`
            }
        `;

        const bookingDateOnly = new Date(booking.date);
        const todayDateOnly = new Date(todayString);
        
        const isPast = bookingDateOnly < todayDateOnly;

        const cancelButton = card.querySelector('.cancel-btn');
        if (isPast && isCancellable) {
            cancelButton.textContent = 'Expired';
            cancelButton.disabled = true;
        } else if (isCancellable) {
            cancelButton.addEventListener('click', function() {
                if (confirm(`Are you sure you want to cancel booking ${booking.id} for ${booking.resource} on ${booking.date} at ${booking.time}?`)) {
                    cancelBooking(parseInt(this.getAttribute('data-index')));
                }
            });
        }

        listContainer.appendChild(card);
    });
}

function cancelBooking(index) {
    const booking = bookingHistory[index];

    if (booking.type === 'Library') {
        const slots = getOrCreateSlots(booking.slotDate).library;
        if (slots[booking.slotIndex] && typeof slots[booking.slotIndex].seats === 'number') {
             slots[booking.slotIndex].seats = booking.originalSeats;
        }
    } else if (booking.type === 'Court') {
        const slots = getOrCreateSlots(booking.slotDate).courts[booking.slotSport];
        if (slots[booking.slotIndex] && typeof slots[booking.slotIndex].available === 'boolean') {
            slots[booking.slotIndex].available = true;
        }
    }

    if (document.getElementById('libraryPage').classList.contains('active')) {
        displayLibrarySlots(booking.slotDate);
    } else if (document.getElementById('courtPage').classList.contains('active')) {
         displayCourtSlots(booking.slotDate, booking.slotSport);
    }
    
    bookingHistory.splice(index, 1);
    
    saveState(); 
    displayAllBookings();
    
    setTimeout(() => {
        alert(`✅ Booking ${booking.id} has been successfully cancelled. The slot is now available for others.`);
    }, 100);
}