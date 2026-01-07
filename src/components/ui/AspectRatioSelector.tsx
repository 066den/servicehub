'use client'

import { Label } from './label'
import { RadioGroup, RadioGroupItem } from './radio-group'
import {
  ASPECT_RATIOS,
  getAspectRatioLabel,
  type AspectRatioType,
} from '@/lib/aspectRatios'

interface AspectRatioSelectorProps {
  value: number
  onChange: (ratio: number) => void
  className?: string
}

export const AspectRatioSelector = ({
  value,
  onChange,
  className,
}: AspectRatioSelectorProps) => {
  const handleRatioChange = (ratioType: AspectRatioType) => {
    onChange(ASPECT_RATIOS[ratioType])
  }

  const currentType = Object.entries(ASPECT_RATIOS).find(
    ([, ratio]) => Math.abs(ratio - value) < 0.001
  )?.[0] as AspectRatioType | undefined

  return (
    <div className={className}>
      <Label className="text-sm font-medium">Пропорции изображения</Label>
      <RadioGroup
        value={currentType || 'SQUARE'}
        onValueChange={handleRatioChange}
        className="mt-2"
      >
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(ASPECT_RATIOS).map(([type]) => (
            <div key={type} className="flex items-center space-x-2">
              <RadioGroupItem value={type} id={type} />
              <Label htmlFor={type} className="text-xs cursor-pointer">
                {getAspectRatioLabel(type as AspectRatioType)}
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>

      <div className="mt-3 p-2 bg-muted rounded-md">
        <p className="text-xs text-muted-foreground">
          Текущая пропорция: {value.toFixed(3)}:1
        </p>
      </div>
    </div>
  )
}
