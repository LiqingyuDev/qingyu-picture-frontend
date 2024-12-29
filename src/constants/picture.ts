/**
 * 图片审核状态枚举常量类
 */
export const PIC_REVIEW_STATUS_ENUM = {
  REVIEWING: 0,
  PASS: 1,
  REJECT: 2,
}

export const PIC_REVIEW_STATUS_MAP = {
  '0': '待审核',
  '1': '已过审',
  '2': '拒绝',
}

/**
 * 根据 PIC_REVIEW_STATUS_MAP 生成的选项数组，用于在下拉菜单等组件中显示审核状态选项。
 * 每个选项包含 label 和 value 属性：
 * - label: 状态的中文描述
 * - value: 对应的枚举值字符串
 */
export const PIC_REVIEW_STATUS_OPTIONS = Object.keys(PIC_REVIEW_STATUS_MAP).map((key) => {
  return {
    //@ts-ignore
    label: PIC_REVIEW_STATUS_MAP[key],
    value: key,
  }
})
