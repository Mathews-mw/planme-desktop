import noTasksImage from '../../assets/to_do_notes.png';
import { motion } from 'motion/react';

export function NoTasks() {
	return (
		<motion.div
			key="no-starred"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.1 }}
		>
			<div className="flex w-full flex-col items-center justify-center gap-4">
				<img src={noTasksImage} alt="No starred task" className="w-1/4 object-cover" />
				<div className="flex flex-col items-center justify-center">
					<span className="text-center text-lg font-semibold text-muted-foreground">No Tasks Yet</span>
					<p className="text-center text-muted-foreground">Add your to-dos and keep track of your tasks</p>
				</div>
			</div>
		</motion.div>
	);
}
