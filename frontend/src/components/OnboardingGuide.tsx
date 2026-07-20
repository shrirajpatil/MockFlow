'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Rocket, MousePointerClick, PlayCircle, Sparkles, Terminal } from 'lucide-react';
import useStore from '@/store/useStore';
import { templates } from '@/lib/templates';

interface OnboardingGuideProps {
    open: boolean;
    onClose: () => void;
}

export default function OnboardingGuide({ open, onClose }: OnboardingGuideProps) {
    const [step, setStep] = useState(0);
    const { setNodes, setEdges } = useStore();

    const startWithTemplate = () => {
        const starter = templates.find((t) => t.id === 'users-list') ?? templates[0];
        if (starter) {
            setNodes(starter.nodes);
            setEdges(starter.edges);
        }
        onClose();
    };

    const steps = [
        {
            title: 'Welcome to MockFlow',
            description: 'Design, test, and deploy mock APIs — no backend code required',
            icon: <Rocket className="w-12 h-12 text-indigo-500" />,
            content: (
                <div className="space-y-4">
                    <p className="text-indigo-200/60">
                        Build API endpoints visually by connecting nodes on a canvas, then deploy them to a real,
                        callable URL in one click.
                    </p>
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4">
                        <h4 className="font-semibold text-indigo-200 mb-2">The 4-step flow:</h4>
                        <ul className="space-y-2 text-sm text-indigo-300/80">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                                <span><strong>Build</strong> — drag nodes onto the canvas and connect them</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                                <span><strong>Test</strong> — run it instantly in the browser, no deploy needed</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                                <span><strong>Save</strong> — store the workflow to come back to later</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                                <span><strong>Deploy</strong> — get a live URL you can call with curl or any HTTP client</span>
                            </li>
                        </ul>
                    </div>
                </div>
            ),
        },
        {
            title: 'Step 1 — Build a workflow',
            description: 'Every workflow starts with a Request node and ends with a Response node',
            icon: <MousePointerClick className="w-12 h-12 text-violet-500" />,
            content: (
                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-lg p-4">
                        <h4 className="font-semibold text-violet-200 mb-1">The only two you need to start</h4>
                        <p className="text-xs text-indigo-200/40 mb-3">Every workflow is just these two, connected.</p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-white/5 rounded p-3 border border-violet-500/20">
                                <div className="font-medium text-violet-300">Request</div>
                                <div className="text-xs text-indigo-200/40 mt-1">Defines the method + path that triggers this workflow</div>
                            </div>
                            <div className="bg-white/5 rounded p-3 border border-violet-500/20">
                                <div className="font-medium text-violet-300">Response</div>
                                <div className="text-xs text-indigo-200/40 mt-1">What gets sent back — status code + JSON body</div>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                        <h4 className="text-xs font-semibold text-indigo-200/60 uppercase tracking-wider mb-2.5">
                            Add these later, only when your logic needs them
                        </h4>
                        <ul className="space-y-1.5 text-xs text-indigo-200/50">
                            <li><span className="text-indigo-200/80 font-medium">Validation</span> — reject requests missing required fields</li>
                            <li><span className="text-indigo-200/80 font-medium">Transformation</span> — reshape data before it reaches the response</li>
                            <li><span className="text-indigo-200/80 font-medium">Conditional</span> — branch the flow, e.g. a different response if unauthorized</li>
                            <li><span className="text-indigo-200/80 font-medium">State</span> — remember data between separate requests</li>
                        </ul>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                        <p className="text-sm text-amber-300">
                            💡 <strong>Tip:</strong> drag a node from the sidebar onto the canvas, then drag from the dot
                            on its bottom edge to the top of the next node to connect them.
                        </p>
                    </div>
                </div>
            ),
        },
        {
            title: 'Step 2 — Configure & test',
            description: 'Click any node to edit it, then run your workflow without deploying',
            icon: <PlayCircle className="w-12 h-12 text-emerald-500" />,
            content: (
                <div className="space-y-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                        <h4 className="font-semibold text-emerald-200 mb-3">Quick configuration:</h4>
                        <div className="space-y-3 text-sm text-emerald-300/80">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-200 font-bold shrink-0">1</div>
                                <div>
                                    <div className="font-medium text-emerald-200">Click a node</div>
                                    <div className="text-xs text-emerald-300/60">Its settings open in the panel on the right — every field there has a short hint under it</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-200 font-bold shrink-0">2</div>
                                <div>
                                    <div className="font-medium text-emerald-200">Response bodies use {'{{'}variable{'}}'}</div>
                                    <div className="text-xs text-emerald-300/60">e.g. {'{{'}request.body.name{'}}'} inserts data from the incoming request</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-200 font-bold shrink-0">3</div>
                                <div>
                                    <div className="font-medium text-emerald-200">Click &quot;Test&quot; in the toolbar</div>
                                    <div className="text-xs text-emerald-300/60">Runs the exact same logic that will run once deployed — see the result immediately</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                        <p className="text-sm text-blue-300">
                            🔌 <strong>Testing an API on your own computer?</strong> The cloud can&apos;t reach
                            <code className="bg-blue-500/20 px-1 rounded mx-1">localhost</code>
                            directly — click <strong>Local APIs</strong> in the toolbar to connect one, no signup needed.
                        </p>
                    </div>
                </div>
            ),
        },
        {
            title: "You're ready",
            description: 'Start from a blank canvas or a working example',
            icon: <CheckCircle2 className="w-12 h-12 text-green-500" />,
            content: (
                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-4">
                        <h4 className="font-semibold text-green-200 mb-3">Fastest way to get going:</h4>
                        <ul className="space-y-2 text-sm text-green-300/80">
                            <li className="flex items-start gap-2">
                                <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>Click <strong>Templates</strong> in the toolbar for ready-made workflows — GET endpoints, validation, branching, and stateful mocks</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Terminal className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>Press <code className="bg-green-500/20 px-1 rounded">Ctrl+/</code> anytime to see keyboard shortcuts</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Rocket className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>When you click <strong>Deploy</strong>, you&apos;ll get a real URL and a &quot;Try it now&quot; button to prove it works</span>
                            </li>
                        </ul>
                    </div>
                    <div className="text-center pt-2">
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                onClick={startWithTemplate}
                                className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600"
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                Start with a template
                            </Button>
                            <Button onClick={onClose} variant="outline">
                                Start from a blank canvas
                            </Button>
                        </div>
                    </div>
                </div>
            ),
        },
    ];

    const currentStep = steps[step];
    if (!currentStep) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-4 mb-4">
                        {currentStep.icon}
                        <div>
                            <DialogTitle className="text-2xl">{currentStep.title}</DialogTitle>
                            <DialogDescription className="text-base mt-1">{currentStep.description}</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="py-4">{currentStep.content}</div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex gap-2">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`h-2 w-2 rounded-full transition-all ${i === step ? 'bg-indigo-500 w-8' : 'bg-white/15'}`}
                            />
                        ))}
                    </div>

                    <div className="flex gap-2">
                        {step > 0 && (
                            <Button variant="outline" onClick={() => setStep(step - 1)}>
                                Previous
                            </Button>
                        )}
                        {step < steps.length - 1 && (
                            <Button
                                onClick={() => setStep(step + 1)}
                                className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600"
                            >
                                Next
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
