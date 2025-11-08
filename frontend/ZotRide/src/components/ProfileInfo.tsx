interface ProfileInfoInputProps {
  label: string
  value: string
}

const ProfileInfoInput = ({ label, value }: ProfileInfoInputProps) => (
  <div className="flex items-baseline gap-4">
    <span className="font-bold text-black text-right text-lg w-[180px]">{label}:</span>
    <div
      className="text-black flex-1 pb-1 text-lg bg-transparent">
      {value}
    </div>
  </div>
)

export default ProfileInfoInput
