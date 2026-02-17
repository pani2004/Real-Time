import React, { useState } from 'react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

interface OptionInputProps {
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  canRemove: boolean;
  index: number;
}

const OptionInput: React.FC<OptionInputProps> = ({
  value,
  onChange,
  onRemove,
  canRemove,
  index,
}) => {
  return (
    <div className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Option ${index + 1}`}
        className="flex-1"
      />
      {canRemove && (
        <Button
          type="button"
          variant="outline"
          onClick={onRemove}
          className="px-3 text-red-600 border-red-600 hover:bg-red-50"
        >
          ✕
        </Button>
      )}
    </div>
  );
};

interface PollFormProps {
  onSubmit: (question: string, options: string[]) => void;
  isLoading: boolean;
}

export const PollForm: React.FC<PollFormProps> = ({ onSubmit, isLoading }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [errors, setErrors] = useState<{ question?: string; options?: string }>({});

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const validate = (): boolean => {
    const newErrors: { question?: string; options?: string } = {};

    if (!question.trim()) {
      newErrors.question = 'Question is required';
    }

    const validOptions = options.filter((opt) => opt.trim().length > 0);
    if (validOptions.length < 2) {
      newErrors.options = 'At least 2 options are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      const validOptions = options.filter((opt) => opt.trim().length > 0);
      onSubmit(question.trim(), validOptions);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Input
          label="Poll Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What would you like to ask?"
          error={errors.question}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Options
        </label>
        <div className="space-y-3">
          {options.map((option, index) => (
            <OptionInput
              key={index}
              value={option}
              onChange={(value) => handleOptionChange(index, value)}
              onRemove={() => handleRemoveOption(index)}
              canRemove={options.length > 2}
              index={index}
            />
          ))}
        </div>
        {errors.options && (
          <p className="mt-2 text-sm text-red-600">{errors.options}</p>
        )}
        {options.length < 10 && (
          <Button
            type="button"
            variant="outline"
            onClick={handleAddOption}
            className="mt-3"
          >
            + Add Option
          </Button>
        )}
        <p className="mt-2 text-xs text-gray-500">
          {options.length}/10 options
        </p>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        className="w-full"
      >
        Create Poll
      </Button>
    </form>
  );
};
