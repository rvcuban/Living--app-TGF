export function StatusStepper({ steps, currentStep }) {
    // Calculamos el índice del estado actual
    const currentIndex = steps.indexOf(currentStep);

    return (
        <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 mb-2">
            {steps.map((stepName, i) => {
                // Determinar si es un paso "pasado", "actual" o "futuro"
                const isCurrent = i === currentIndex;
                const isCompleted = i < currentIndex;

                // Podríamos cambiar el color si está completado
                let circleColor = 'bg-gray-300';
                if (isCompleted) circleColor = 'bg-green-500';
                if (isCurrent) circleColor = 'bg-blue-500';

                return (
                    <div key={stepName} className="flex items-center">
                        <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-white mr-2 ${circleColor}`}
                        >
                            {/* Podrías poner un icono o un número */}
                            {isCompleted ? '✓' : ''}
                        </div>
                        <span className={`text-sm ${isCurrent ? 'font-bold text-blue-600' : 'text-gray-600'}`}>
                            {stepName}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
