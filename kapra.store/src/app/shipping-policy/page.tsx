export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Shipping Policy</h1>
          
          <div className="prose prose-lg mx-auto space-y-6">
            <p className="text-gray-600">
              Last updated: March 15, 2024
            </p>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">Shipping Methods</h2>
              <div className="space-y-4 text-gray-600">
                <h3 className="font-semibold">Standard Delivery</h3>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Lahore: 1-2 business days</li>
                  <li>Major Cities: 2-3 business days</li>
                  <li>Other Cities: 3-5 business days</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">Shipping Costs</h2>
              <div className="space-y-4 text-gray-600">
                <p>Shipping costs are calculated based on:</p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Delivery location</li>
                  <li>Order weight and size</li>
                  <li>Number of items</li>
                </ul>
                <p>Exact shipping costs will be calculated at checkout.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">Order Processing</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Orders are processed within 24 hours on business days</li>
                <li>Business days are Monday through Saturday</li>
                <li>Orders placed after 2 PM will be processed the next business day</li>
                <li>You will receive a tracking number once your order ships</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">Delivery Information</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Signature may be required upon delivery</li>
                <li>Please ensure accurate shipping information</li>
                <li>Additional fees may apply for address changes</li>
                <li>We are not responsible for delays due to customs or weather</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">International Shipping</h2>
              <p className="text-gray-600">
                Currently, we only ship within Pakistan. International shipping will be 
                available soon.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
              <p className="text-gray-600">
                For shipping-related queries, please contact us at{' '}
                <a href="mailto:shipping@almirah.store" className="text-blue-600 hover:underline">
                  shipping@almirah.store
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 