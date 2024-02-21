import React, {useEffect, useRef, useState} from 'react';

type IframeBufferingProps = {
  generateContent: (iframe: HTMLIFrameElement) => void;
  className?: string;
  parentClassName?: string;
  height?: string;
  width?: string;
  testId?: string;
  addDelay?: boolean;
};

const IframeBuffering: React.FC<IframeBufferingProps> = ({generateContent, className, height, width, parentClassName, testId, addDelay = false}) => {
    const [visibleIframeIndex, setVisibleIframeIndex] = useState(0);
    const iframes = [useRef<HTMLIFrameElement>(null), useRef<HTMLIFrameElement>(null)]; // eslint-disable-line
    const [scrollPosition, setScrollPosition] = useState(0);

    useEffect(() => {
        const invisibleIframeIndex = visibleIframeIndex === 0 ? 1 : 0;
        const iframe = iframes[invisibleIframeIndex].current;

        if (iframe) {
            // Start generating the content for the invisible iframe
            generateContent(iframe);

            // Attach a load listener to the iframe
            const onLoad = () => {
                // Once content is loaded, introduce a delay before swapping visibility
                if (addDelay) {
                    setTimeout(() => {
                        setVisibleIframeIndex(invisibleIframeIndex);
                    }, 500); // 500ms delay
                } else {
                    setVisibleIframeIndex(invisibleIframeIndex);
                }
            };

            iframe.addEventListener('load', onLoad);

            return () => {
                // Cleanup: Remove the event listener to prevent memory leaks
                iframe.removeEventListener('load', onLoad);
            };
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [generateContent]);

    // track the scroll position of the visible iframe and set scroll position of the invisible iframe
    useEffect(() => {
        const iframe = iframes[visibleIframeIndex].current;
        const onScroll = () => {
            setScrollPosition(iframe?.contentWindow?.scrollY || 0);
        };

        iframe?.contentWindow?.addEventListener('scroll', onScroll);

        return () => {
            iframe?.contentWindow?.removeEventListener('scroll', onScroll);
        };
    }, [visibleIframeIndex, iframes]);

    useEffect(() => {
        const iframe = iframes[visibleIframeIndex].current;

        if (iframe) {
            iframe.contentWindow?.scrollTo(0, scrollPosition);
        }
    }, [scrollPosition, visibleIframeIndex, iframes]);

    return (
        <div className={parentClassName} data-testid={testId}>
            <iframe
                ref={iframes[0]}
                className={`${className} ${visibleIframeIndex !== 0 ? 'invisible z-10' : 'z-20'}`}
                data-visible={visibleIframeIndex === 0}
                frameBorder="0"
                height={height}
                title="Buffered Preview 1"
                width={width}
            ></iframe>

            <iframe
                ref={iframes[1]}
                className={`${className} ${visibleIframeIndex !== 1 ? 'invisible z-10' : 'z-20'}`}
                data-visible={visibleIframeIndex === 1}
                frameBorder="0"
                height={height}
                title="Buffered Preview 2"
                width={width}
            ></iframe>
        </div>
    );
};

export default IframeBuffering;
