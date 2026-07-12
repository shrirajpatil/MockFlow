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
                    <p className="text-slate-600">
                        Build API endpoints visually by connecting nodes on a canvas, then deploy them to a real,
                        callable URL in one click.
                    </p>
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                        <h4 className="font-semibold text-indigo-900 mb-2">The 4-step flow:</h4>
                        <ul className="space-y-2 text-sm text-indigo-700">
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
                    <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-lg p-4">
                        <h4 className="font-semibold text-violet-900 mb-3">The 6 node types (left sidebar):</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-white rounded p-3 border border-violet-100">
                                <div className="font-medium text-violet-700">Request</div>
                                <div className="text-xs text-slate-500 mt-1">Defines the method + path that triggers this workflow</div>
                            </div>
                            <div className="bg-white rounded p-3 border border-violet-100">
                                <div className="font-medium text-violet-700">Validation</div>
                                <div className="text-xs text-slate-500 mt-1">Rejects requests missing required fields</div>
                            </div>
                            <div className="bg-white rounded p-3 border border-violet-100">
                                <div className="font-medium text-violet-700">Transformation</div>
                                <div className="text-xs text-slate-500 mt-1">Reshapes data before it reaches the response</div>
                            </div>
                            <div className="bg-white rounded p-3 border border-violet-100">
                                <div className="font-medium text-violet-700">Conditional</div>
                                <div className="text-xs text-slate-500 mt-1">Branches the flow — e.g. different response if unauthorized</div>
                            </div>
                            <div className="bg-white rounded p-3 border border-violet-100">
                                <div className="font-medium text-violet-700">State</div>
                                <div className="text-xs text-slate-500 mt-1">Remembers data between separate requests</div>
                            </div>
                            <div className="bg-white rounded p-3 border border-violet-100">
                                <div className="font-medium text-violet-700">Response</div>
                                <div className="text-xs text-slate-500 mt-1">What gets sent back — status code + JSON body</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-sm text-amber-800">
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
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <h4 className="font-semibold text-emerald-900 mb-3">Quick configuration:</h4>
                        <div className="space-y-3 text-sm text-emerald-700">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-900 font-bold shrink-0">1</div>
                                <div>
                                    <div className="font-medium">Click a node</div>
                                    <div className="text-xs text-emerald-600">Its settings open in the panel on the right — every field there has a short hint under it</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-900 font-bold shrink-0">2</div>
                                <div>
                                    <div className="font-medium">Response bodies use {'{{'}variable{'}}'}</div>
                                    <div className="text-xs text-emerald-600">e.g. {'{{'}request.body.name{'}}'} inserts data from the incoming request</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-900 font-bold shrink-0">3</div>
                                <div>
                                    <div className="font-medium">Click &quot;Test&quot; in the toolbar</div>
                                    <div className="text-xs text-emerald-600">Runs the exact same logic that will run once deployed — see the result immediately</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                            🔌 <strong>Testing an API on your own computer?</strong> The cloud can&apos;t reach
                            <code className="bg-blue-100 px-1 rounded mx-1">localhost</code>
                            directly — click <strong>Local APIs</strong> in the toolbar for a guided setup.
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
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-3">Fastest way to get going:</h4>
                        <ul className="space-y-2 text-sm text-green-700">
                            <li className="flex items-start gap-2">
                                <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>Click <strong>Templates</strong> in the toolbar for ready-made workflows — GET endpoints, validation, branching, and stateful mocks</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Terminal className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>Press <code className="bg-green-100 px-1 rounded">Ctrl+/</code> anytime to see keyboard shortcuts</span>
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

                <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex gap-2">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`h-2 w-2 rounded-full transition-all ${i === step ? 'bg-indigo-500 w-8' : 'bg-slate-200'}`}
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
