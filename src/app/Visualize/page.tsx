import React from 'react'
import StepProgres from '@/components/StepProgres'
import NextBack from '@/components/NextBack'

const Visualize = () => {
  return (
    <>
        {/* Step Progress */}
        <div className="mx-10">
            <StepProgres currentStep={3} />
        </div>
        {/* Left */}
        <div className='visualize-option'>Pilihan Visualisasi</div>
        {/* Center */}
        <div className='vizualize-result'>Visualisasi</div>
        {/* Right */}
        <div className='analysis'>Hasil Analisis</div>
        {/* Bottom */}
        <div className='query-btn'>Query Data</div>
        <NextBack nextLink="/EmededCode" backLink="/CheckData" />
    </>
  )
}

export default Visualize