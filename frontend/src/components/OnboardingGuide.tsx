'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Rocket, Zap, FileJson } from 'lucide-react';

interface OnboardingGuideProps {
    open: boolean;
    onClose: () => void;
}

export default function OnboardingGuide({ open, onClose }: OnboardingGuideProps) {
    const [step, setStep] = useState(0);

    const steps = [
        {
            title: "Welcome to MockFlow! 🎉",
            description: "Let's get you started in 3 simple steps",
            icon: <Rocket className="w-12 h-12 text-indigo-500" />,
            content: (
                <div className="space-y-4">
                    <p className="text-slate-600">
                        MockFlow helps you create mock APIs and test workflows visually - no coding required!
                    </p>
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                        <h4 className="font-semibold text-indigo-900 mb-2">What you can do:</h4>
                        <ul className="space-y-2 text-sm text-indigo-700">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>Create visual workflows with drag-and-drop</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>Test local APIs (Java, Python, Node.js)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>Deploy mock endpoints instantly</span>
                            </li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            title: "Step 1: Build Your Workflow",
            description: "Drag nodes from the library to create your API flow",
            icon: <Zap className="w-12 h-12 text-violet-500" />,
            content: (
                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-lg p-4">
                        <h4 className="font-semibold text-violet-900 mb-3">Available Nodes:</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-white rounded p-3 border border-violet-100">
                                <div className="font-medium text-violet-700">Request</div>
                                <div className="text-xs text-slate-500 mt-1">Define API endpoint</div>
                            </div>
                            <div className="bg-white rounded p-3 border border-violet-100">
                                <div className="font-medium text-violet-700">Response</div>
                                <div className="text-xs text-slate-500 mt-1">Return data</div>
                            </div>
                            <div className="bg-white rounded p-3 border border-violet-100">
                                <div className="font-medium text-violet-700">Validation</div>
                                <div className="text-xs text-slate-500 mt-1">Check data</div>
                            </div>
                            <div className="bg-white rounded p-3 border border-violet-100">
                                <div className="font-medium text-violet-700">Transform</div>
                                <div className="text-xs text-slate-500 mt-1">Modify data</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-sm text-amber-800">
                            💡 <strong>Tip:</strong> Connect nodes by dragging from the dot on the right to another node
                        </p>
                    </div>
                </div>
            )
        },
        {
            title: "Step 2: Configure & Test",
            description: "Click nodes to configure, then test your workflow",
            icon: <FileJson className="w-12 h-12 text-emerald-500" />,
            content: (
                <div className="space-y-4">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <h4 className="font-semibold text-emerald-900 mb-3">Quick Configuration:</h4>
                        <div className="space-y-3 text-sm text-emerald-700">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-900 font-bold flex-shrink-0">1</div>
                                <div>
                                    <div className="font-medium">Click a node</div>
                                    <div className="text-xs text-emerald-600">Configuration panel appears on the right</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-900 font-bold flex-shrink-0">2</div>
                                <div>
                                    <div className="font-medium">Fill in the details</div>
                                    <div className="text-xs text-emerald-600">Use the example values as a guide</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-900 font-bold flex-shrink-0">3</div>
                                <div>
                                    <div className="font-medium">Click "Test" button</div>
                                    <div className="text-xs text-emerald-600">See your workflow in action!</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                            🚀 <strong>Pro Tip:</strong> Use full URLs (https://...) to call external APIs, or /path for mock endpoints
                        </p>
                    </div>
                </div>
            )
        },
        {
            title: "You're Ready! 🎊",
            description: "Start building amazing workflows",
            icon: <CheckCircle2 className="w-12 h-12 text-green-500" />,
            content: (
                <div className="space-y-4">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-900 mb-3">Next Steps:</h4>
                        <ul className="space-y-2 text-sm text-green-700">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>Try the ready-made templates in the <code className="bg-green-100 px-1 rounded">workflows/</code> folder</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>Press <code className="bg-green-100 px-1 rounded">Ctrl+/</code> to see keyboard shortcuts</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>Check the guides: SETUP.md, JAVA_API_TESTING_GUIDE.md</span>
                            </li>
                        </ul>
                    </div>
                    <div className="text-center">
                        <p className="text-slate-600 mb-4">Have fun building! 🚀</p>
                        <Button
                            onClick={onClose}
                            className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600"
                        >
                            Start Building
                        </Button>
                    </div>
                </div>
            )
        }
    ];

    const currentStep = steps[step];

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

                <div className="py-4">
                    {currentStep.content}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex gap-2">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`h-2 w-2 rounded-full transition-all ${i === step ? 'bg-indigo-500 w-8' : 'bg-slate-200'
                                    }`}
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
