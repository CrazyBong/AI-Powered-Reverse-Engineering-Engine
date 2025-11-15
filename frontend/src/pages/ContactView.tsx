import Header from '../components/Header';
import { Mail, Code2, Rocket } from 'lucide-react';

export default function ContactView() {
  return (
    <>
      <Header />
      <div className="min-h-screen pt-32 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Code2 className="w-20 h-20 text-black mx-auto mb-6" />
            <h1 className="text-white mb-4">Contact</h1>
            <p className="text-white/70 max-w-2xl mx-auto">
              Re:verse is built and maintained by the VorteX team. We're passionate about making
              reverse engineering more accessible through AI-powered tools.
            </p>
          </div>

          <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-12 mb-8">
            <div className="flex items-center justify-center gap-4 mb-8">
              <Rocket className="w-16 h-16 text-purple-400" />
              <div>
                <h2 className="text-white/90">Built by VorteX</h2>
                <p className="text-white/50">Advanced Security Research & Development</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                <Mail className="w-8 h-8 text-blue-400 mb-3" />
                <h3 className="text-white/90 mb-2">General Inquiries</h3>
                <p className="text-white/60 mb-3">
                  Questions about Re:verse or want to learn more about our technology?
                </p>
                <a
                  href="mailto:contact@vortex.security"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  contact@vortex.security
                </a>
              </div>

              <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                <Code2 className="w-8 h-8 text-green-400 mb-3" />
                <h3 className="text-white/90 mb-2">Technical Support</h3>
                <p className="text-white/60 mb-3">
                  Need help with analysis or found a bug? Our team is here to assist.
                </p>
                <a
                  href="mailto:support@vortex.security"
                  className="text-green-400 hover:text-green-300 transition-colors"
                >
                  support@vortex.security
                </a>
              </div>
            </div>
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-8">
            <h3 className="text-white/90 mb-4 text-center">About VorteX</h3>
            <p className="text-white/60 text-center max-w-2xl mx-auto leading-relaxed">
              VorteX is a cutting-edge security research organization focused on developing
              next-generation tools for malware analysis, reverse engineering, and threat
              intelligence. Our mission is to empower security researchers with AI-enhanced
              capabilities that streamline complex analysis workflows and accelerate
              vulnerability discovery.
            </p>
          </div>

          <div className="mt-12 text-center">
            <p className="text-white/40">
              © 2025 VorteX Security Research. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}