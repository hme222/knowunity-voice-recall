'use client'

import { useRouter } from 'next/navigation'
import { BottomSheet, MascotSlot, PickerRow, ScreenShell } from '@/components'
import { PICKER_DRILLS, setDrillTerm, setPractising } from '@/lib/session'
import styles from '../picker.module.css'

// Drill a definition, as a sheet over the picker (designer, 2026-10-14: the picker fits
// without scrolling, with the drill list behind one row). A sheet lives on its own
// branch route (ScreenShell § showBottomSheetBackground).

export default function PickerDrillsPage() {
  const router = useRouter()
  return (
    <ScreenShell
      showBottomSheetBackground
      bottomSheetOnly={
        <BottomSheet
          Title="Definition Drill Down"
          subtitle="The ones marked “Worth a drill” need the most work."
          onDismiss={() => router.push('/picker')}
        >
          <div className={styles.sheetMascot}>
            <MascotSlot size="2XL" expression="excited" />
          </div>
          <div className={styles.group}>
            {PICKER_DRILLS.map((d) => (
              <PickerRow
                key={d.label}
                raised
                variant="drill"
                label={d.label}
                state={d.state}
                onClick={() => {
                  setPractising(false)
                  setDrillTerm(d.term)
                  router.push('/drill/intro')
                }}
              />
            ))}
          </div>
        </BottomSheet>
      }
    >
      <div className="screenTitle">
        <h1 className="screenTitleHeading">Say It Back</h1>
      </div>
    </ScreenShell>
  )
}
