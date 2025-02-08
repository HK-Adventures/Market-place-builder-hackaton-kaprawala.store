import Image from 'next/image';

export default function StoreLocatorPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6 text-gray-900">Coming Soon to Your City</h1>
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div className="mb-8">
              <div className="relative w-full h-[400px]">
                <Image
                  src="/map-placeholder.jpg"
                  alt="Store locations map"
                  fill
                  className="object-cover rounded-lg"
                  priority
                />
              </div>
              <p className="text-xl text-gray-600 mb-4">
                We are excited to announce that KAPRA will soon be opening physical stores across major cities.
              </p>
              <p className="text-gray-600 mb-8">
                Experience our premium collection in person, with expert styling advice and personalized service.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-left">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Initial Locations</h2>
                <ul className="space-y-4 text-gray-600">
                  <li className="flex items-center">
                    <span className="text-2xl mr-3">📍</span>
                    <div>
                      <p className="font-semibold">New York</p>
                      <p className="text-sm">Fifth Avenue - Opening Summer 2024</p>
                    </div>
                  </li>
                  <li className="flex items-center">
                    <span className="text-2xl mr-3">📍</span>
                    <div>
                      <p className="font-semibold">Los Angeles</p>
                      <p className="text-sm">Beverly Hills - Opening Fall 2024</p>
                    </div>
                  </li>
                  <li className="flex items-center">
                    <span className="text-2xl mr-3">📍</span>
                    <div>
                      <p className="font-semibold">Chicago</p>
                      <p className="text-sm">Magnificent Mile - Opening Winter 2024</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="text-left">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Stay Updated</h2>
                <p className="text-gray-600 mb-4">
                  Want to know when we are opening in your city? Sign up for our newsletter to receive updates.
                </p>
                <form className="space-y-4">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-900"
                  />
                  <button
                    type="submit"
                    className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Keep Me Posted
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="text-gray-600">
            <p className="mb-4">For business inquiries and partnership opportunities:</p>
            <p className="font-semibold">Email: business@kapra.com</p>
          </div>
        </div>
      </div>
    </div>
  );
} 