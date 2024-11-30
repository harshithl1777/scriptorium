import { MultipleSelector, Option } from '@/components/ui/multi-selector';

const TagsSelector = ({
    onChange,
    disabled,
    className,
}: {
    onChange: (options: string[]) => void;
    disabled: boolean;
    className: string;
}) => {
    return (
        <div className='flex w-full flex-col gap-5'>
            <MultipleSelector
                defaultOptions={[]}
                placeholder='Select up to 5 tags...'
                creatable
                maxSelected={5}
                hidePlaceholderWhenSelected
                onChange={(options) => {
                    const tags = options.map((option: Option) => option.value);
                    onChange(tags);
                }}
                disabled={disabled}
                className={className}
            />
        </div>
    );
};

export default TagsSelector;
