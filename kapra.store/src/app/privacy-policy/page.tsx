export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg mx-auto space-y-6">
            <p className="text-gray-600">
              Last updated: March 15, 2024
            </p>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>
              <p className="text-gray-600">
                We collect information you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Name and contact information</li>
                <li>Billing and shipping addresses</li>
                <li>Payment information</li>
                <li>Order history and preferences</li>
                <li>Communications with our customer service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
              <p className="text-gray-600">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Process your orders and payments</li>
                <li>Send order confirmations and updates</li>
                <li>Respond to your questions and requests</li>
                <li>Improve our services and products</li>
                <li>Send marketing communications (with your consent)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">Data Security</h2>
              <p className="text-gray-600">
                We implement appropriate security measures to protect your personal information. 
                However, no method of transmission over the Internet is 100% secure, and we 
                cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">Your Rights</h2>
              <p className="text-gray-600">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
              <p className="text-gray-600">
                If you have questions about our Privacy Policy, please contact us at{' '}
                <a href="mailto:privacy@almirah.store" className="text-blue-600 hover:underline">
                  privacy@almirah.store
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 