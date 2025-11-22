interface ProfileInfoInputProps {
  label: string
  value: string
}

const ProfileInfoInput = ({ label, value }: ProfileInfoInputProps) => (
  <div className="flex items-baseline gap-4">
    <span className="font-bold text-black text-right text-lg w-[180px]">{label}:</span>
    <input
      type="text"
      placeholder={value}
      className="text-black border-b-2 border-black text-lg flex-1 pb-1 bg-transparent focus:outline-none placeholder-black/50"
    />
  </div>
)

export default ProfileInfoInput
