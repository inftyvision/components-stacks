import { motion } from 'framer-motion';

export default function HtmlPreview() {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white">HTML Preview</h2>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-gray-900 rounded-lg shadow-xl overflow-hidden"
      >
        <div className="h-[600px] overflow-auto">
          <iframe
            srcDoc={`
              <!DOCTYPE html>
              <html>
                <head>
                  <style>
                    body {
                      font-family: system-ui, -apple-system, sans-serif;
                      line-height: 1.6;
                      color: #e5e7eb;
                      background: #111827;
                      padding: 2rem;
                      max-width: 65ch;
                      margin: 0 auto;
                    }
                    h1, h2, h3 { color: #f3f4f6; margin-top: 2rem; }
                    h1 { font-size: 2.25rem; }
                    h2 { font-size: 1.875rem; }
                    h3 { font-size: 1.5rem; }
                    p { margin: 1.5rem 0; }
                    .highlight { color: #818cf8; }
                    .container { max-width: 800px; margin: 0 auto; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <h1>Welcome to Our Design System</h1>
                    <p>
                      Lorem ipsum dolor sit amet, <span class="highlight">consectetur adipiscing elit</span>. 
                      Nullam pulvinar risus non risus hendrerit venenatis. Pellentesque sit amet hendrerit risus, 
                      sed porttitor quam.
                    </p>
                    <h2>Key Features</h2>
                    <p>
                      Maecenas accumsan lacus vel velit tincidunt, eu sagittis magna luctus. Sed vehicula quam ut 
                      sapien pellentesque, vitae pharetra dolor efficitur. Praesent rutrum sem diam, vitae egestas 
                      enim auctor sit amet.
                    </p>
                    <h3>Advanced Components</h3>
                    <p>
                      Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; 
                      Fusce porttitor metus eget lectus consequat, sit amet feugiat magna vulputate.
                    </p>
                    <h3>Responsive Design</h3>
                    <p>
                      Curabitur lobortis id lorem id bibendum. Ut id consectetur magna. Quisque volutpat augue enim, 
                      pulvinar lobortis nibh lacinia at. Vestibulum nec erat ut mi sollicitudin porttitor id sit amet risus.
                    </p>
                    <h2>Getting Started</h2>
                    <p>
                      Nam mollis, est in tristique vulputate, nisl nibh pulvinar eros, eu ultrices felis enim eu nibh. 
                      Vestibulum nec suscipit sem. Sed mollis sem at condimentum auctor.
                    </p>
                    <p>
                      Morbi maximus lacinia lorem, vitae congue nisi tempus ut. Donec venenatis tellus enim, 
                      vitae tempor eros faucibus in. Vestibulum cursus nisi leo, non ultrices velit aliquam vel.
                    </p>
                  </div>
                </body>
              </html>
            `}
            className="w-full h-full border-0"
            title="HTML Preview"
          />
        </div>
      </motion.div>
    </div>
  );
} 