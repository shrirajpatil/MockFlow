import { ImageResponse } from 'next/og';
import { SITE_NAME } from '@/lib/seo';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const dynamic = 'force-static';

export default function OpengraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#0a0d1a',
                    backgroundImage:
                        'radial-gradient(circle at 25% 20%, rgba(99,102,241,0.35) 0%, rgba(99,102,241,0) 45%), radial-gradient(circle at 80% 70%, rgba(245,158,11,0.16) 0%, rgba(245,158,11,0) 45%)',
                    fontFamily: 'sans-serif',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 20,
                        marginBottom: 36,
                    }}
                >
                    <div
                        style={{
                            width: 84,
                            height: 84,
                            borderRadius: 20,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, #818cf8, #6366f1, #4f46e5)',
                        }}
                    >
                        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" fill="white" />
                        </svg>
                    </div>
                    <div style={{ display: 'flex', color: 'white', fontSize: 64, fontWeight: 700 }}>
                        {SITE_NAME}
                    </div>
                </div>
                <div
                    style={{
                        display: 'flex',
                        color: '#c7d2fe',
                        fontSize: 32,
                        maxWidth: 860,
                        textAlign: 'center',
                        lineHeight: 1.4,
                    }}
                >
                    Build, test, and deploy mock APIs visually
                </div>
            </div>
        ),
        { ...size }
    );
}
