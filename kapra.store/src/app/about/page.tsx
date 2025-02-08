export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">About ALMIRAH</h1>
          
          <div className="prose prose-lg mx-auto">
            <p className="text-gray-600 mb-6">
              Welcome to ALMIRAH, your premier destination for quality clothing in Pakistan. 
              Founded with a vision to provide affordable yet stylish clothing, we&apos;ve grown 
              to become one of the most trusted online clothing retailers in the country.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Our Story</h2>
            <p className="text-gray-600 mb-6">
              Established in 2024, ALMIRAH began as a small family business with a simple 
              mission: to make quality fashion accessible to everyone. Today, we serve 
              customers across Pakistan, offering a carefully curated selection of 
              clothing that combines style, comfort, and affordability.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Our Values</h2>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>Quality: We never compromise on the quality of our products</li>
              <li>Affordability: Fair prices for premium clothing</li>
              <li>Customer Service: Your satisfaction is our top priority</li>
              <li>Sustainability: Committed to ethical and sustainable practices</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Our Promise</h2>
            <p className="text-gray-600 mb-6">
              At ALMIRAH, we promise to provide you with:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>Authentic, high-quality products</li>
              <li>Secure and convenient shopping experience</li>
              <li>Fast and reliable delivery</li>
              <li>Excellent customer support</li>
            </ul>

            <div className="bg-gray-50 p-6 rounded-lg mt-8">
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="text-gray-600">
                Have questions? We&apos;d love to hear from you. Send us a message at{' '}
                <a href="mailto:support@kaprawala.store" className="text-blue-600 hover:underline">
                  support@kaprawala.store
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 