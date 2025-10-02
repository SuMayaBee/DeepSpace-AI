"use client"

import { useStarStore } from "@/lib/star-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, Settings, Brain, Zap, Target, Activity, Play, Pause, RotateCcw, Save } from "lucide-react"
import { useState, useEffect, createContext, useContext } from "react"

// Create context for hyperparameter tuning
const HyperparameterContext = createContext<{
  learningRate: number
  batchSize: number
  epochs: number
  dropoutRate: number
  regularization: number
  isTraining: boolean
  currentEpoch: number
  loss: number
  accuracy: number
  setLearningRate: (value: number) => void
  setBatchSize: (value: number) => void
  setEpochs: (value: number) => void
  setDropoutRate: (value: number) => void
  setRegularization: (value: number) => void
  startTraining: () => void
  pauseTraining: () => void
  resetTraining: () => void
}>({
  learningRate: 0.001,
  batchSize: 32,
  epochs: 100,
  dropoutRate: 0.2,
  regularization: 0.01,
  isTraining: false,
  currentEpoch: 0,
  loss: 1.0,
  accuracy: 0,
  setLearningRate: () => {},
  setBatchSize: () => {},
  setEpochs: () => {},
  setDropoutRate: () => {},
  setRegularization: () => {},
  startTraining: () => {},
  pauseTraining: () => {},
  resetTraining: () => {},
})

export const useHyperparameter = () => useContext(HyperparameterContext)

export function HyperparameterTuningUI() {
  const { returnToSpace, currentView } = useStarStore()
  
  // Interactive state
  const [learningRate, setLearningRate] = useState(0.001)
  const [batchSize, setBatchSize] = useState(32)
  const [epochs, setEpochs] = useState(100)
  const [dropoutRate, setDropoutRate] = useState(0.2)
  const [regularization, setRegularization] = useState(0.01)
  const [isTraining, setIsTraining] = useState(false)
  const [currentEpoch, setCurrentEpoch] = useState(0)
  const [loss, setLoss] = useState(1.0)
  const [accuracy, setAccuracy] = useState(0)

  // Dynamic metrics calculation based on hyperparameters
  useEffect(() => {
    // Calculate base metrics based on hyperparameters
    const baseAccuracy = Math.min(95, 
      (learningRate * 10000) * 0.3 + 
      (batchSize / 128) * 20 + 
      (epochs / 500) * 30 + 
      (1 - dropoutRate) * 15 + 
      (1 - regularization * 10) * 10
    )
    
    const baseLoss = Math.max(0.01, 
      1.0 - (learningRate * 10000) * 0.2 - 
      (batchSize / 128) * 0.3 - 
      (epochs / 500) * 0.4 - 
      (1 - dropoutRate) * 0.1
    )

    // Update metrics immediately when parameters change
    if (!isTraining) {
      setAccuracy(baseAccuracy)
      setLoss(baseLoss)
    }
  }, [learningRate, batchSize, epochs, dropoutRate, regularization, isTraining])

  // Training simulation
  useEffect(() => {
    if (!isTraining) return

    const interval = setInterval(() => {
      setCurrentEpoch(prev => {
        if (prev >= epochs) {
          setIsTraining(false)
          return prev
        }
        
        // Simulate training progress with hyperparameter influence
        const progress = prev / epochs
        const learningRateEffect = learningRate * 10000
        const batchSizeEffect = batchSize / 128
        const epochEffect = epochs / 500
        
        // Loss decreases based on hyperparameters
        setLoss(prev => Math.max(0.01, prev * (0.9 + learningRateEffect * 0.05)))
        
        // Accuracy increases based on hyperparameters
        setAccuracy(prev => Math.min(99.9, prev + (0.3 + learningRateEffect * 0.2 + batchSizeEffect * 0.1)))
        
        return prev + 1
      })
    }, 200) // Update every 200ms for smooth animation

    return () => clearInterval(interval)
  }, [isTraining, epochs, learningRate, batchSize])

  const startTraining = () => {
    setIsTraining(true)
  }

  const pauseTraining = () => {
    setIsTraining(false)
  }

  const resetTraining = () => {
    setIsTraining(false)
    setCurrentEpoch(0)
    setLoss(1.0)
    setAccuracy(0)
  }

  if (currentView !== "hyperparameter-tuning") return null

  return (
    <HyperparameterContext.Provider value={{
      learningRate,
      batchSize,
      epochs,
      dropoutRate,
      regularization,
      isTraining,
      currentEpoch,
      loss,
      accuracy,
      setLearningRate,
      setBatchSize,
      setEpochs,
      setDropoutRate,
      setRegularization,
      startTraining,
      pauseTraining,
      resetTraining,
    }}>
      {/* Navigation buttons */}
      <div className="fixed top-4 left-4 z-[60]">
        <Button
          onClick={returnToSpace}
          variant="outline"
          size="lg"
          className="bg-black/80 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm text-base px-6 py-3"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Space
        </Button>
      </div>

      {/* Page Title */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60]">
        <h1 className="text-2xl font-bold text-white bg-black/50 px-6 py-2 rounded-lg backdrop-blur-sm border border-white/20">
          Hyperparameter Tuning
        </h1>
      </div>

      {/* Training Status Overlay */}
      {isTraining && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[70]">
          <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
            <div className="px-8 py-6">
              <div className="flex items-center justify-center gap-4 mb-3">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50"></div>
                <div className="text-white font-bold text-xl tracking-wide">AI TRAINING</div>
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/50"></div>
              </div>
              <div className="text-white/80 text-sm text-center space-y-1">
                <div>Epoch {currentEpoch} of {epochs}</div>
                <div className="flex items-center justify-center gap-6 text-xs">
                  <span className="text-red-300">Loss: {loss.toFixed(4)}</span>
                  <span className="text-green-300">Accuracy: {accuracy.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Model Parameters Panel */}
      <div className="fixed top-20 right-4 z-[60] w-80">
        <Card className="bg-black/80 border-white/20 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400 animate-pulse" />
              AI Model Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Learning Rate */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white text-sm font-medium">Learning Rate</span>
                <span className="text-purple-400 text-sm font-bold">{learningRate.toFixed(4)}</span>
              </div>
              <Slider
                value={[learningRate]}
                onValueChange={(value) => setLearningRate(value[0])}
                min={0.0001}
                max={0.01}
                step={0.0001}
                className="w-full"
              />
              <div className="w-full bg-gray-700/30 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300" 
                  style={{width: `${(learningRate / 0.01) * 100}%`}}
                ></div>
              </div>
            </div>

            {/* Batch Size */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white text-sm font-medium">Batch Size</span>
                <span className="text-purple-400 text-sm font-bold">{batchSize}</span>
              </div>
              <Slider
                value={[batchSize]}
                onValueChange={(value) => setBatchSize(value[0])}
                min={8}
                max={128}
                step={8}
                className="w-full"
              />
              <div className="w-full bg-gray-700/30 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300" 
                  style={{width: `${((batchSize - 8) / (128 - 8)) * 100}%`}}
                ></div>
              </div>
            </div>

            {/* Epochs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white text-sm font-medium">Epochs</span>
                <span className="text-purple-400 text-sm font-bold">{epochs}</span>
              </div>
              <Slider
                value={[epochs]}
                onValueChange={(value) => setEpochs(value[0])}
                min={10}
                max={500}
                step={10}
                className="w-full"
              />
              <div className="w-full bg-gray-700/30 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-green-500 h-2 rounded-full transition-all duration-300" 
                  style={{width: `${((epochs - 10) / (500 - 10)) * 100}%`}}
                ></div>
              </div>
            </div>

            {/* Dropout Rate */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white text-sm font-medium">Dropout Rate</span>
                <span className="text-purple-400 text-sm font-bold">{dropoutRate.toFixed(2)}</span>
              </div>
              <Slider
                value={[dropoutRate]}
                onValueChange={(value) => setDropoutRate(value[0])}
                min={0.0}
                max={0.8}
                step={0.05}
                className="w-full"
              />
              <div className="w-full bg-gray-700/30 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-yellow-500 h-2 rounded-full transition-all duration-300" 
                  style={{width: `${(dropoutRate / 0.8) * 100}%`}}
                ></div>
              </div>
            </div>

            {/* Regularization */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white text-sm font-medium">Regularization</span>
                <span className="text-purple-400 text-sm font-bold">{regularization.toFixed(3)}</span>
              </div>
              <Slider
                value={[regularization]}
                onValueChange={(value) => setRegularization(value[0])}
                min={0.001}
                max={0.1}
                step={0.001}
                className="w-full"
              />
              <div className="w-full bg-gray-700/30 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-300" 
                  style={{width: `${((regularization - 0.001) / (0.1 - 0.001)) * 100}%`}}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Training Status Panel */}
      <div className="fixed bottom-4 left-4 z-[60] w-80">
        <Card className="bg-black/80 border-white/20 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
              Training Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Epoch */}
            <div className="flex items-center justify-between">
              <span className="text-white text-sm">Current Epoch</span>
              <span className="text-yellow-400 font-bold">{currentEpoch}/{epochs}</span>
            </div>

            {/* Loss */}
            <div className="flex items-center justify-between">
              <span className="text-white text-sm">Loss</span>
              <span className="text-red-400 font-bold">{loss.toFixed(4)}</span>
            </div>

            {/* Accuracy */}
            <div className="flex items-center justify-between">
              <span className="text-white text-sm">Accuracy</span>
              <span className="text-green-400 font-bold">{accuracy.toFixed(1)}%</span>
            </div>

            {/* Hyperparameter Impact Indicator */}
            <div className="bg-white/5 rounded-lg p-2 border border-white/10">
              <div className="text-xs text-white/70 mb-1">Parameter Impact</div>
              <div className="flex items-center gap-2 text-xs">
                <div className="flex-1">
                  <div className="text-purple-300">LR: {(learningRate * 10000).toFixed(1)}</div>
                  <div className="text-blue-300">BS: {batchSize}</div>
                </div>
                <div className="flex-1">
                  <div className="text-cyan-300">EP: {epochs}</div>
                  <div className="text-green-300">DR: {(dropoutRate * 100).toFixed(0)}%</div>
                </div>
              </div>
            </div>

            {/* Training Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white text-sm">Progress</span>
                <span className="text-white text-sm">{Math.round((currentEpoch / epochs) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-700/30 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 h-3 rounded-full transition-all duration-500" 
                  style={{width: `${(currentEpoch / epochs) * 100}%`}}
                ></div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex gap-2 pt-2">
              <Button 
                onClick={startTraining}
                disabled={isTraining}
                size="sm" 
                className="flex-1 bg-green-600/20 border-green-400/30 text-green-400 hover:bg-green-600/30 disabled:opacity-50"
              >
                <Play className="w-4 h-4 mr-1" />
                {isTraining ? 'Training...' : 'Start'}
              </Button>
              <Button 
                onClick={pauseTraining}
                disabled={!isTraining}
                size="sm" 
                className="flex-1 bg-yellow-600/20 border-yellow-400/30 text-yellow-400 hover:bg-yellow-600/30 disabled:opacity-50"
              >
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </Button>
              <Button 
                onClick={resetTraining}
                size="sm" 
                className="bg-red-600/20 border-red-400/30 text-red-400 hover:bg-red-600/30"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics Panel */}
      <div className="fixed bottom-4 right-4 z-[60] w-80">
        <Card className="bg-black/80 border-white/20 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-cyan-400 animate-pulse" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Validation Accuracy */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white text-sm">Validation Accuracy</span>
                <span className="text-cyan-400 font-bold">{(accuracy * 0.95).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700/30 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300" 
                  style={{width: `${Math.min(100, accuracy * 0.95)}%`}}
                ></div>
              </div>
            </div>

            {/* Precision */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white text-sm">Precision</span>
                <span className="text-cyan-400 font-bold">{(accuracy * 0.97).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700/30 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300" 
                  style={{width: `${Math.min(100, accuracy * 0.97)}%`}}
                ></div>
              </div>
            </div>

            {/* Recall */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white text-sm">Recall</span>
                <span className="text-cyan-400 font-bold">{(accuracy * 0.93).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700/30 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300" 
                  style={{width: `${Math.min(100, accuracy * 0.93)}%`}}
                ></div>
              </div>
            </div>

            {/* F1 Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white text-sm">F1 Score</span>
                <span className="text-cyan-400 font-bold">{(accuracy * 0.95).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-700/30 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-pink-500 to-red-500 h-2 rounded-full transition-all duration-300" 
                  style={{width: `${Math.min(100, accuracy * 0.95)}%`}}
                ></div>
              </div>
            </div>

            {/* Save Configuration Button */}
            <div className="pt-2">
              <Button 
                onClick={() => {
                  const config = {
                    learningRate,
                    batchSize,
                    epochs,
                    dropoutRate,
                    regularization,
                    timestamp: new Date().toISOString()
                  }
                  console.log('Saved configuration:', config)
                  alert('Configuration saved! Check console for details.')
                }}
                size="sm" 
                className="w-full bg-purple-600/20 border-purple-400/30 text-purple-400 hover:bg-purple-600/30"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Configuration
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Training Clock Widget */}
      {isTraining && (
        <div className="fixed top-20 left-4 z-[70]">
          <div className="bg-black/90 backdrop-blur-2xl border border-green-500/40 rounded-3xl shadow-2xl shadow-green-500/30 p-8 relative overflow-hidden">
            {/* Background Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-emerald-500/10 rounded-3xl"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-green-500/5 to-transparent rounded-3xl"></div>
            
            {/* Clock Face */}
            <div className="relative w-32 h-32 mx-auto mb-6">
              {/* Outer Glow Ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 blur-sm scale-110"></div>
              
              {/* Clock Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-black/80 rounded-full border-2 border-green-500/40 shadow-inner"></div>
              
              {/* Progress Ring */}
              <div className="absolute inset-0 rounded-full">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(34, 197, 94, 0.15)"
                    strokeWidth="8"
                  />
                  {/* Progress Circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - currentEpoch / epochs)}`}
                    className="transition-all duration-700 ease-out"
                    style={{
                      filter: 'drop-shadow(0 0 12px #22C55E) drop-shadow(0 0 24px #22C55E)',
                      strokeDasharray: `${2 * Math.PI * 45}`,
                    }}
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#22C55E" />
                      <stop offset="30%" stopColor="#16A34A" />
                      <stop offset="70%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#84CC16" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              
              {/* Center Hub */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-lg shadow-green-400/60 border border-green-300/50"></div>
              
              {/* Progress Text */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl font-black tracking-tight" style={{textShadow: '0 0 8px #FFFFFF, 0 0 16px #FFFFFF, 0 0 24px #3B82F6'}}>
                {Math.round((currentEpoch / epochs) * 100)}%
              </div>
            </div>
            
            {/* Training Info */}
            <div className="text-center space-y-3 relative z-10">
              <div className="text-green-400 text-lg font-bold tracking-wide" style={{textShadow: '0 0 8px #22C55E'}}>
                TRAINING
              </div>
              <div className="bg-green-500/10 rounded-lg px-4 py-2 border border-green-500/20">
                <div className="text-green-300 text-sm font-semibold">
                  {currentEpoch}/{epochs} Epochs
                </div>
                <div className="text-green-200/80 text-xs mt-1">
                  Loss: {loss.toFixed(3)}
                </div>
              </div>
            </div>
            
            {/* Animated Border */}
            <div className="absolute inset-0 rounded-3xl border border-green-500/20 animate-pulse"></div>
          </div>
        </div>
      )}
    </HyperparameterContext.Provider>
  )
}
