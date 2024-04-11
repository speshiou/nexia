import CreateImageTextInput from '@/components/create-image-input'
import { CreateImageTaskProvider } from '@/components/create-image-task'
import CreateImageRefDropArea from '@/components/create-image-drop-area'
import CreateImageContent from '@/components/create-image-content'

export default function ImageCreator() {
  return (
    <main className="m-4 lg:m-10">
      <CreateImageTaskProvider>
        <CreateImageRefDropArea>
          <CreateImageTextInput />
          <CreateImageContent />
        </CreateImageRefDropArea>
      </CreateImageTaskProvider>
    </main>
  )
}
