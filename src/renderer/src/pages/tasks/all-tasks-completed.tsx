import zeroTasksImage from '../../assets/zero_tasks.png';
import { motion } from 'motion/react';

export function AllTasksCompleted() {
	return (
		<motion.div
			key="no-starred"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.1 }}
		>
			<div className="flex w-full flex-col items-center justify-center gap-4">
				<img src={zeroTasksImage} alt="No starred task" className="w-1/4 object-cover" />
				<div className="flex flex-col items-center justify-center">
					<span className="text-center text-lg font-semibold text-muted-foreground">All tasks completed</span>
					<p className="text-center text-muted-foreground">Nice work!</p>
				</div>
			</div>
		</motion.div>
	);
}
