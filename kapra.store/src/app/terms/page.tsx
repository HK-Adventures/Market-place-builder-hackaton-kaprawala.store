export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Terms and Conditions</h1>
          
          <div className="prose prose-lg mx-auto space-y-6">
            <p className="text-gray-600">
              Last updated: March 15, 2024
            </p>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600">
                By accessing and using ALMIRAH&apos;s website and services, you agree to be bound by these 
                Terms and Conditions. If you do not agree with any part of these terms, please do 
                not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">2. Order and Payment</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>All orders are subject to availability and confirmation of the order price</li>
                <li>Prices are in Pakistani Rupees (PKR) and include applicable taxes</li>
                <li>Payment must be made in full before order processing</li>
                <li>We accept various payment methods including credit cards and cash on delivery</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">3. Shipping and Delivery</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Delivery times are estimates and not guaranteed</li>
                <li>Shipping costs are calculated based on delivery location and order size</li>
                <li>Risk of loss and title pass to you upon delivery</li>
                <li>You are responsible for providing accurate shipping information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">4. Returns and Refunds</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Returns accepted within 7 days of delivery</li>
                <li>Items must be unused and in original packaging</li>
                <li>Refunds processed within 5-7 business days</li>
                <li>Shipping costs for returns are customer&apos;s responsibility</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">5. Product Information</h2>
              <p className="text-gray-600">
                While we strive for accuracy, we do not warrant that product descriptions or other 
                content is accurate, complete, or current. Colors may vary due to display settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">6. Limitation of Liability</h2>
              <p className="text-gray-600">
                ALMIRAH shall not be liable for any indirect, incidental, special, consequential, or 
                punitive damages arising from your use of our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">Contact</h2>
              <p className="text-gray-600">
                For questions about these Terms and Conditions, please contact us at{' '}
                <a href="mailto:legal@almirah.store" className="text-blue-600 hover:underline">
                  legal@almirah.store
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 