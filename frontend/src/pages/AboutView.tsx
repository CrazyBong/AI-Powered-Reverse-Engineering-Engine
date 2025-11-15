import Header from '../components/Header';
import { Shield, Cpu, Brain, Zap, Network, MessageSquare } from 'lucide-react';

export default function AboutView() {
  return (
    <>
      <Header />
      <div className="min-h-screen pt-32 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Shield className="w-20 h-20 text-black mx-auto mb-6" />
            <h1 className="text-white mb-4">About Re:verse</h1>
            <p className="text-white/70 max-w-3xl mx-auto">
              Re:verse is an AI-powered reverse engineering platform that combines advanced static
              analysis with cutting-edge artificial intelligence to help security researchers,
              malware analysts, and reverse engineers understand complex binary code.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="p-8 bg-black/30 backdrop-blur-sm rounded-xl border border-white/10">
              <Cpu className="w-12 h-12 text-blue-400 mb-4" />
              <h2 className="text-white/90 mb-3">Advanced Static Analysis</h2>
              <p className="text-white/60">
                Powered by radare2, Re:verse automatically extracts functions, analyzes control
                flow, and generates detailed disassembly from executable binaries. Support for
                multiple architectures including x86, x64, ARM, and more.
              </p>
            </div>

            <div className="p-8 bg-black/30 backdrop-blur-sm rounded-xl border border-white/10">
              <Brain className="w-12 h-12 text-purple-400 mb-4" />
              <h2 className="text-white/90 mb-3">AI-Powered Explanations</h2>
              <p className="text-white/60">
                Leveraging GPT-5, Re:verse provides intelligent, context-aware explanations of
                assembly code, helping you understand complex algorithms, identify security
                vulnerabilities, and detect malicious behavior patterns.
              </p>
            </div>

            <div className="p-8 bg-black/30 backdrop-blur-sm rounded-xl border border-white/10">
              <Zap className="w-12 h-12 text-yellow-400 mb-4" />
              <h2 className="text-white/90 mb-3">Smart Caching System</h2>
              <p className="text-white/60">
                Intelligent LocalStorage caching ensures that previously analyzed functions are
                instantly available, dramatically reducing analysis time and API costs for
                repeated investigations.
              </p>
            </div>

            <div className="p-8 bg-black/30 backdrop-blur-sm rounded-xl border border-white/10">
              <Network className="w-12 h-12 text-green-400 mb-4" />
              <h2 className="text-white/90 mb-3">Control Flow Graphs</h2>
              <p className="text-white/60">
                <span className="text-orange-400">[Coming Soon]</span> Visualize function logic
                with interactive control flow graphs. Navigate through basic blocks, understand
                branching logic, and identify code patterns with ease.
              </p>
            </div>
          </div>

          <div className="p-10 bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 mb-12">
            <MessageSquare className="w-14 h-14 text-cyan-400 mx-auto mb-4" />
            <h2 className="text-white/90 text-center mb-4">AI Chat Assistant</h2>
            <p className="text-white/60 text-center mb-6 max-w-3xl mx-auto">
              <span className="text-orange-400">[Coming Soon - Phase 7]</span>
            </p>
            <p className="text-white/60 text-center max-w-3xl mx-auto">
              The next evolution of Re:verse includes an interactive AI chatbot that allows you to
              ask follow-up questions about specific instructions, request pseudocode translations,
              clarify suspicious behaviors, and receive step-by-step guidance through complex
              reverse engineering challenges. Transform your analysis workflow into an interactive
              conversation with AI.
            </p>
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-10">
            <h2 className="text-white/90 mb-6 text-center">Complete Feature Roadmap</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-green-400 mb-3">✓ Implemented</h3>
                <ul className="space-y-2 text-white/60">
                  <li>• Binary upload & validation</li>
                  <li>• Function extraction</li>
                  <li>• Disassembly viewer</li>
                  <li>• AI explanations (GPT-5)</li>
                  <li>• Smart caching</li>
                  <li>• Progress tracking</li>
                </ul>
              </div>
              <div>
                <h3 className="text-orange-400 mb-3">⧗ In Development</h3>
                <ul className="space-y-2 text-white/60">
                  <li>• Control Flow Graphs</li>
                  <li>• Interactive graph navigation</li>
                  <li>• Basic block highlighting</li>
                  <li>• Call graph visualization</li>
                </ul>
              </div>
              <div>
                <h3 className="text-blue-400 mb-3">○ Planned (Phase 7)</h3>
                <ul className="space-y-2 text-white/60">
                  <li>• AI Chat Assistant</li>
                  <li>• Follow-up Q&A system</li>
                  <li>• Pseudocode generation</li>
                  <li>• Multi-function comparison</li>
                  <li>• Export to Markdown/PDF</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-white/50">
              Re:verse combines the power of Ghidra-level analysis with the intelligence of
              ChatGPT, all inside your browser.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}