"use client";

export default function ContactForm() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          alert("Mesajınız alınmıştır. Teşekkür ederiz!");
        }}
        className="space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Adınız Soyadınız
          </label>
          <input
            type="text"
            name="name"
            required
            className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Adınız ve soyadınız"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            E-posta Adresiniz
          </label>
          <input
            type="email"
            name="email"
            required
            className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="ornek@eposta.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Mesajınız
          </label>
          <textarea
            name="message"
            rows={6}
            required
            className="w-full px-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Mesajınızı buraya yazın..."
          />
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
        >
          Mesajı Gönder
        </button>
      </form>
    </div>
  );
}
