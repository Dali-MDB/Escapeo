import { useState } from 'react';

const CardInformation = ({handleInitReservation}) => {
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expDate: '',
    cvc: '',
    name: '',
    country: '',
    saveInfo: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCardData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e) => {
    const formattedValue = formatCardNumber(e.target.value);
    setCardData(prev => ({
      ...prev,
      cardNumber: formattedValue
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Handle form submission
    console.log('Card data submitted:', cardData);
    handleInitReservation();
    

  };

  return (
    <div className="max-w-md absolute top-1/4 left-1/3 z-10 mx-auto p-6 bg-white rounded-lg shadow-2xl rounded-xl">
      <h2 className="text-2xl font-bold mb-6">Add a new Card</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
            <input
              type="text"
              name="cardNumber"
              value={cardData.cardNumber}
              onChange={handleCardNumberChange}
              placeholder="4321 4321 4321 4321"
              maxLength="19"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
               
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exp. Date</label>
              <input
                type="text"
                name="expDate"
                value={cardData.expDate}
                onChange={handleChange}
                placeholder="MM/YY"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
              <input
                type="text"
                name="cvc"
                value={cardData.cvc}
                onChange={handleChange}
                placeholder="123"
                maxLength="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
            <input
              type="text"
              name="name"
              value={cardData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
               
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country or Region</label>
            <select
              name="country"
              value={cardData.country}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
               
            >
              <option value="">Select a country</option>
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="United Kingdom">United Kingdom</option>
              {/* Add more countries as needed */}
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="saveInfo"
              name="saveInfo"
              checked={cardData.saveInfo}
              onChange={handleChange}
              className="h-4 w-4 text-[var(--primary)] focus:ring-[var(--primary)] border-gray-300 rounded"
            />
            <label htmlFor="saveInfo" className="ml-2 block text-sm text-gray-700">
              Securely save my information for 1-click checkout
            </label>
          </div>
        </div>

        <div className="mt-8">
          <button
            type="submit"

            className="w-full bg-[var(--secondary)] text-black hover:text-white py-3 px-4 rounded-md hover:bg-[var(--primary)] transition duration-200"
          >
            Add Card
          </button>
        </div>
      </form>

      <p className="mt-4 text-xs text-gray-500">
        By confirming your subscription, you allow The Outdoor Inn Crowd Limited to charge your card for this payment and future payments in accordance with their terms. You can always cancel your subscription.
      </p>
    </div>
  );
};

export default CardInformation;