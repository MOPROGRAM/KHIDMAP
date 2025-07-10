"use client";

import React, { useEffect, useState } from 'react';

const BackgroundShapes: React.FC = () => {
    const [shapes, setShapes] = useState<React.ReactNode[]>([]);

    useEffect(() => {
        const createShapes = () => {
            const shapeArray: React.ReactNode[] = [];
            const numberOfShapes = 20;

            for (let i = 0; i < numberOfShapes; i++) {
                const size = Math.random() * 80 + 20; // 20px to 100px
                const left = Math.random() * 100;
                const animationDuration = Math.random() * 10 + 15; // 15s to 25s
                const animationDelay = Math.random() * 15;

                shapeArray.push(
                    <span
                        key={i}
                        style={{
                            width: `${size}px`,
                            height: `${size}px`,
                            left: `${left}%`,
                            animationDuration: `${animationDuration}s`,
                            animationDelay: `${animationDelay}s`,
                        }}
                    ></span>
                );
            }
            setShapes(shapeArray);
        };
        
        createShapes();
    }, []);

    return <div className="background-shapes">{shapes}</div>;
};

export default BackgroundShapes;
