export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Return & Exchange Policy</h1>
          
          <div className="prose prose-lg mx-auto space-y-6">
            <p className="text-gray-600">
              Last updated: March 15, 2024
            </p>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">Return Period</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Items can be returned within 7 days of delivery</li>
                <li>Exchange requests must be initiated within 7 days</li>
                <li>Return period starts from the date of delivery</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">Return Conditions</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Items must be unused and in original condition</li>
                <li>Original tags must be attached</li>
                <li>Original packaging must be intact</li>
                <li>Items must be free from wear, tear, or damage</li>
                <li>All accessories must be included</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">Non-Returnable Items</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Customized or personalized items</li>
                <li>Intimate wear and undergarments</li>
                <li>Sale or discounted items</li>
                <li>Items marked as non-returnable</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">Return Process</h2>
              <ol className="list-decimal list-inside text-gray-600 space-y-2 ml-4">
                <li>Initiate return through your account or contact support</li>
                <li>Receive return authorization and shipping label</li>
                <li>Pack item securely with all original materials</li>
                <li>Ship item back using provided label</li>
                <li>Refund processed within 5-7 business days after inspection</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">Exchange Process</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Size exchanges are free of charge</li>
                <li>Different item exchanges may require price adjustment</li>
                <li>Exchange items shipped after original return is received</li>
                <li>Subject to stock availability</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">Refund Information</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Original payment method will be refunded</li>
                <li>Shipping costs are non-refundable</li>
                <li>Return shipping costs are customer&apos;s responsibility</li>
                <li>Store credit option available for faster processing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
              <p className="text-gray-600">
                For return or exchange related queries, please contact us at{' '}
                <a href="mailto:returns@almirah.store" className="text-blue-600 hover:underline">
                  returns@almirah.store
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 