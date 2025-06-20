import React, { useState } from 'react';

function Counter() {
    const [count, setCount] = useState(0);

    return (
        <div>
            <h3>Current count: {count}</h3>
            <button onClick={() => setCount(count + 1)}>
                Increment
            </button>
            <button onClick={() => setCount(count - 1)}>
                Decrement
            </button>
            <button onClick={() => setCount(0)}>
                Reset
            </button>
            {/* Message conditionnel qui s'affiche uniquement si count > 10 */}
            {count > 10 && (
                <p style={{ color: 'green' }}>
                    You've clicked a lot! Are you having fun with React?
                </p>
            )}
        </div>
    );
}

export default Counter;